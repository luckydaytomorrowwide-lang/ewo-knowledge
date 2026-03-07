import type { WfNode, WfDepType, ForEachZone, EwoJson } from '../types'
import { isWfDep, isWfDepLiteral, isWfDepOneOf } from '../types'
import { extractWiring } from '../extractWiring'
import type { Wiring } from '../types'
import type { WfRegistry } from './registry'
import { resolveAc } from './acWorker'

const MAX_EXPANSION_DEPTH = 10

export interface ExpandedResult {
  wfDef: {
    nodes: WfNode[]
    forEachZones?: ForEachZone[]
    outputs: Record<string, string>
  }
  wiring: Wiring
}

export function expandInlineWfCalls(
  ewoJson: EwoJson,
  registry: WfRegistry,
): ExpandedResult {
  const expandedNodes: WfNode[] = deepCloneNodes(ewoJson.wfDef.nodes)
  const expandedZones: ForEachZone[] = ewoJson.wfDef.forEachZones
    ? JSON.parse(JSON.stringify(ewoJson.wfDef.forEachZones))
    : []
  const expandedOutputs: Record<string, string> = { ...ewoJson.wfDef.outputs }
  const wfId = ewoJson.id

  let depth = 0

  while (true) {
    const callNode = expandedNodes.find(
      n => n.wfCall && n.wfCall.boundary === false,
    )
    if (!callNode) break

    depth++
    if (depth > MAX_EXPANSION_DEPTH) {
      throw new Error(
        `[InlineExpander] Expansion depth exceeded ${MAX_EXPANSION_DEPTH} — possible circular wfCall reference`,
      )
    }

    const prefix = callNode.id
    const callee = callNode.wfCall!.callee
    const entry = registry.lookup(callee, callNode.wfCall!.calleeVersion)
    if (!entry) {
      if (resolveAc(callee)) {
        console.log(
          `[InlineExpander] "${callee}" not in WfRegistry but found as activity — executing as regular operation`,
        )
        delete callNode.wfCall
        continue
      }
      throw new Error(`[InlineExpander] callee "${callee}" not found in registry`)
    }

    const childDef = entry.ewoJson.wfDef
    console.log(
      `[InlineExpander] Expanding ${callee} into ${prefix}/ (${childDef.nodes.length} child nodes)`,
    )

    // Step 1 + 2: Clone child nodes with prefix and remap deps
    const prefixedChildNodes = expandChildNodes(
      childDef.nodes,
      prefix,
      callNode,
    )

    // Step 3: Migrate guard from callNode to child entry nodes
    if (callNode.guard) {
      migrateGuard(prefixedChildNodes, callNode)
    }

    // Step 4: Prefix child ForEachZones
    if (childDef.forEachZones) {
      for (const zone of childDef.forEachZones) {
        expandedZones.push(prefixZone(zone, prefix, callNode))
      }
    }

    // Step 5: Build output mapping
    const outputMap = buildOutputMap(childDef.outputs, prefix)

    // Step 6: Remap downstream parent nodes that depend on the wfCall node
    remapDownstreamDeps(expandedNodes, callNode.id, outputMap)

    // Step 7: Remap parent wfDef.outputs
    remapWfOutputs(expandedOutputs, callNode.id, outputMap)

    // Step 8: Remove wfCall node, insert prefixed child nodes
    const callIdx = expandedNodes.findIndex(n => n.id === callNode.id)
    expandedNodes.splice(callIdx, 1, ...prefixedChildNodes)

    // Also update any parent zone that contained the wfCall node
    for (const zone of expandedZones) {
      const idx = zone.nodes.indexOf(callNode.id)
      if (idx !== -1) {
        zone.nodes.splice(idx, 1, ...prefixedChildNodes.map(n => n.id))
      }
    }
  }

  // Step 9: Regenerate wiring from expanded wfDef
  const finalWfDef = {
    nodes: expandedNodes,
    forEachZones: expandedZones.length > 0 ? expandedZones : undefined,
    outputs: expandedOutputs,
  }
  const finalWiring = extractWiring(
    { ...finalWfDef, inputs: ewoJson.inputs } as any,
    wfId,
  )

  return { wfDef: finalWfDef, wiring: finalWiring }
}

function expandChildNodes(
  childNodes: WfNode[],
  prefix: string,
  callNode: WfNode,
): WfNode[] {
  const result: WfNode[] = []

  for (const childNode of childNodes) {
    const newNode: WfNode = JSON.parse(JSON.stringify(childNode))
    newNode.id = `${prefix}/${childNode.id}`

    const newDeps: Record<string, WfDepType> = {}
    for (const [depKey, depSpec] of Object.entries(newNode.deps)) {
      newDeps[depKey] = remapDep(depSpec, prefix, callNode)
    }
    newNode.deps = newDeps

    result.push(newNode)
  }

  return result
}

function remapDep(
  depSpec: WfDepType,
  prefix: string,
  callNode: WfNode,
): WfDepType {
  if (isWfDepLiteral(depSpec)) {
    return depSpec
  }

  if (isWfDep(depSpec)) {
    if (depSpec.sourceAcId === '$input') {
      const parentDep = callNode.deps[depSpec.sourcePort]
      if (!parentDep) {
        throw new Error(
          `[InlineExpander] Child requires input "${depSpec.sourcePort}" but parent wfCall node "${callNode.id}" has no dep for it`,
        )
      }
      return JSON.parse(JSON.stringify(parentDep))
    }

    if (depSpec.sourceAcId === '$zoneInput') {
      return depSpec
    }

    if (depSpec.sourceAcId.startsWith('$zone:')) {
      const zoneRef = depSpec.sourceAcId.slice(6)
      return {
        sourceAcId: `$zone:${prefix}/${zoneRef}`,
        sourcePort: depSpec.sourcePort,
      }
    }

    return {
      sourceAcId: `${prefix}/${depSpec.sourceAcId}`,
      sourcePort: depSpec.sourcePort,
    }
  }

  if (isWfDepOneOf(depSpec)) {
    return {
      oneOf: depSpec.oneOf.map((alt) => {
        if (alt.sourceAcId === '$input') {
          const parentDep = callNode.deps[alt.sourcePort]
          if (parentDep && isWfDep(parentDep)) {
            return { sourceAcId: parentDep.sourceAcId, sourcePort: parentDep.sourcePort }
          }
          return alt
        }
        return {
          sourceAcId: `${prefix}/${alt.sourceAcId}`,
          sourcePort: alt.sourcePort,
        }
      }),
    }
  }

  return depSpec
}

function migrateGuard(
  prefixedChildNodes: WfNode[],
  callNode: WfNode,
): void {
  const entryNodes = prefixedChildNodes.filter(n =>
    Object.values(n.deps).some(d => cameFromParentInput(d, callNode)),
  )

  if (entryNodes.length === 0) return

  for (const entryNode of entryNodes) {
    entryNode.guard = callNode.guard

    for (const [depKey, depSpec] of Object.entries(callNode.deps)) {
      if (!(depKey in entryNode.deps)) {
        entryNode.deps[depKey] = JSON.parse(JSON.stringify(depSpec))
      }
    }
  }
}

function cameFromParentInput(dep: WfDepType, callNode: WfNode): boolean {
  if (isWfDep(dep)) {
    for (const parentDep of Object.values(callNode.deps)) {
      if (isWfDep(parentDep)
        && dep.sourceAcId === parentDep.sourceAcId
        && dep.sourcePort === parentDep.sourcePort) {
        return true
      }
    }
  }
  return false
}

function prefixZone(
  zone: ForEachZone,
  prefix: string,
  callNode: WfNode,
): ForEachZone {
  const newZone: ForEachZone = JSON.parse(JSON.stringify(zone))
  newZone.id = `${prefix}/${zone.id}`
  newZone.nodes = zone.nodes.map(nid => `${prefix}/${nid}`)
  newZone.outputNodeId = `${prefix}/${zone.outputNodeId}`

  if (newZone.collectionSource.sourceAcId === '$input') {
    const parentDep = callNode.deps[newZone.collectionSource.sourcePort]
    if (parentDep && isWfDep(parentDep)) {
      newZone.collectionSource = {
        sourceAcId: parentDep.sourceAcId,
        sourcePort: parentDep.sourcePort,
      }
    }
  } else {
    newZone.collectionSource.sourceAcId =
      `${prefix}/${newZone.collectionSource.sourceAcId}`
  }

  return newZone
}

function buildOutputMap(
  childOutputs: Record<string, string>,
  prefix: string,
): Map<string, { sourceAcId: string; sourcePort: string }> {
  const map = new Map<string, { sourceAcId: string; sourcePort: string }>()

  for (const [portName, ref] of Object.entries(childOutputs)) {
    const dotIdx = ref.indexOf('.')
    if (dotIdx === -1) continue
    const childNodeId = ref.substring(0, dotIdx)
    const childPort = ref.substring(dotIdx + 1)
    map.set(portName, {
      sourceAcId: `${prefix}/${childNodeId}`,
      sourcePort: childPort,
    })
  }

  return map
}

function remapDownstreamDeps(
  nodes: WfNode[],
  callNodeId: string,
  outputMap: Map<string, { sourceAcId: string; sourcePort: string }>,
): void {
  for (const node of nodes) {
    if (node.id === callNodeId) continue

    for (const [depKey, depSpec] of Object.entries(node.deps)) {
      if (isWfDep(depSpec) && depSpec.sourceAcId === callNodeId) {
        const mapped = outputMap.get(depSpec.sourcePort)
        if (mapped) {
          depSpec.sourceAcId = mapped.sourceAcId
          depSpec.sourcePort = mapped.sourcePort
        }
      } else if (isWfDepOneOf(depSpec)) {
        for (const alt of depSpec.oneOf) {
          if (alt.sourceAcId === callNodeId) {
            const mapped = outputMap.get(alt.sourcePort)
            if (mapped) {
              alt.sourceAcId = mapped.sourceAcId
              alt.sourcePort = mapped.sourcePort
            }
          }
        }
      }
    }
  }
}

function remapWfOutputs(
  outputs: Record<string, string>,
  callNodeId: string,
  outputMap: Map<string, { sourceAcId: string; sourcePort: string }>,
): void {
  for (const [key, ref] of Object.entries(outputs)) {
    const dotIdx = ref.indexOf('.')
    if (dotIdx === -1) continue
    const refNodeId = ref.substring(0, dotIdx)
    const refPort = ref.substring(dotIdx + 1)
    if (refNodeId === callNodeId) {
      const mapped = outputMap.get(refPort)
      if (mapped) {
        outputs[key] = `${mapped.sourceAcId}.${mapped.sourcePort}`
      }
    }
  }
}

function deepCloneNodes(nodes: WfNode[]): WfNode[] {
  return JSON.parse(JSON.stringify(nodes))
}
