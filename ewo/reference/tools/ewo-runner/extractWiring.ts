import type { WfDef, Wiring, WiringRoute, WiringEmit, ForEachZone } from './types'
import { isWfDep, isWfDepOneOf, isZoneDep, isZoneInputDep } from './types'

function collectAllZoneNodes(zones: ForEachZone[]): Set<string> {
  const set = new Set<string>()
  for (const z of zones) {
    for (const nid of z.nodes) set.add(nid)
    if (z.childZones) {
      for (const nid of collectAllZoneNodes(z.childZones)) set.add(nid)
    }
  }
  return set
}

function flattenZones(zones: ForEachZone[]): ForEachZone[] {
  const result: ForEachZone[] = []
  for (const z of zones) {
    result.push(z)
    if (z.childZones) {
      result.push(...flattenZones(z.childZones))
    }
  }
  return result
}

export function extractWiring(wfDef: WfDef, wfId: string): Wiring {
  const emitMap = new Map<string, WiringEmit[]>()
  const zones = wfDef.forEachZones ?? []
  const allZones = flattenZones(zones)
  const zoneNodeSet = collectAllZoneNodes(zones)

  for (const node of wfDef.nodes) {
    for (const [portName, dep] of Object.entries(node.deps)) {
      const sources: { sourceAcId: string }[] = []

      if (isWfDep(dep)) {
        sources.push(dep)
      } else if (isWfDepOneOf(dep)) {
        sources.push(...dep.oneOf)
      }

      for (const src of sources) {
        if (src.sourceAcId === '$input') continue
        if (src.sourceAcId === '$zoneInput') continue
        if (src.sourceAcId.startsWith('$zone:')) continue

        const sourceKey = src.sourceAcId
        if (!emitMap.has(sourceKey)) {
          emitMap.set(sourceKey, [])
        }

        const emits = emitMap.get(sourceKey)!
        const emitType = `${node.id}.${portName}`

        if (!emits.some(e => e.type === emitType)) {
          emits.push({
            type: emitType,
            wfid: wfId,
            map: 'outputRef->payloadRef',
          })
        }
      }
    }
  }

  // Zone-specific routes (including child zones)
  for (const zone of allZones) {
    const srcAcId = zone.collectionSource.sourceAcId
    if (srcAcId !== '$input') {
      if (!emitMap.has(srcAcId)) {
        emitMap.set(srcAcId, [])
      }
      const emits = emitMap.get(srcAcId)!
      const emitType = `$zone:${zone.id}.input`
      if (!emits.some(e => e.type === emitType)) {
        emits.push({
          type: emitType,
          wfid: wfId,
          map: 'outputRef->payloadRef',
        })
      }
    }

    // Zone completion route: $zone:ZoneId.done → downstream deps (in parent zone or main WF)
    for (const node of wfDef.nodes) {
      for (const [portName, dep] of Object.entries(node.deps)) {
        if (!isWfDep(dep)) continue
        if (!dep.sourceAcId.startsWith('$zone:')) continue
        const refZoneId = dep.sourceAcId.slice(6)
        if (refZoneId === zone.id) {
          const zoneKey = `$zone:${zone.id}`
          if (!emitMap.has(zoneKey)) {
            emitMap.set(zoneKey, [])
          }
          const emits = emitMap.get(zoneKey)!
          const emitType = `${node.id}.${portName}`
          if (!emits.some(e => e.type === emitType)) {
            emits.push({
              type: emitType,
              wfid: wfId,
              map: 'outputRef->payloadRef',
            })
          }
        }
      }
    }
  }

  // Terminal node → wf.completed
  const terminalNodeIds = findTerminalNodes(wfDef, zoneNodeSet)
  for (const termId of terminalNodeIds) {
    if (!emitMap.has(termId)) {
      emitMap.set(termId, [])
    }
    emitMap.get(termId)!.push({
      type: 'wf.completed',
      wfid: wfId,
      map: 'outputRef->payloadRef',
    })
  }

  addResultEmitsForFanOut(emitMap, wfId)

  const routes: WiringRoute[] = []
  for (const [sourceAcId, emits] of emitMap) {
    routes.push({
      id: `R-${sourceAcId}`,
      when: { type: `${sourceAcId}.done` },
      correlate: { by: ['correlationid'] },
      emit: emits,
    })
  }

  return { version: 1, routes }
}

function findTerminalNodes(wfDef: WfDef, zoneNodeSet: Set<string>): string[] {
  const outputSources = new Set(
    Object.values(wfDef.outputs).map(v => v.split('.')[0])
  )

  if (outputSources.size > 0) return [...outputSources]

  const referencedAsSource = new Set<string>()
  for (const node of wfDef.nodes) {
    if (zoneNodeSet.has(node.id)) continue
    for (const dep of Object.values(node.deps)) {
      const srcs: string[] = []
      if (isWfDep(dep)) {
        srcs.push(dep.sourceAcId)
      } else if (isWfDepOneOf(dep)) {
        srcs.push(...dep.oneOf.map(a => a.sourceAcId))
      }
      for (const src of srcs) {
        if (src !== '$input' && !src.startsWith('$zone')) {
          referencedAsSource.add(src)
        }
      }
    }
  }

  return wfDef.nodes
    .filter(n => !zoneNodeSet.has(n.id) && !referencedAsSource.has(n.id))
    .map(n => n.id)
}

function addResultEmitsForFanOut(
  emitMap: Map<string, WiringEmit[]>,
  wfId: string,
) {
  for (const [sourceAcId, emits] of emitMap) {
    const targetPortEmits = emits.filter(e => e.type !== 'wf.completed')
    if (targetPortEmits.length <= 1) continue

    const resultType = `${sourceAcId}.result`
    if (!emits.some(e => e.type === resultType)) {
      emits.unshift({
        type: resultType,
        wfid: wfId,
        map: 'outputRef->payloadRef',
      })
    }
  }
}
