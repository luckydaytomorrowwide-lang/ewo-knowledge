import type { EwoCloudEvent } from './cloudEvent'
import { createCloudEvent } from './cloudEvent'
import type { EventBus } from './eventBus'
import type { PayloadStore } from './payloadStore'
import { type WfNode, type WfDepType, type ForEachZone, isWfDep, isWfDepLiteral, isWfDepOneOf, isZoneInputDep } from '../types'
import { evaluateGuard } from './guardEval'

export type NodeState = 'pending' | 'running' | 'done' | 'skipped' | 'error'

export interface ZoneIterationScope {
  arrivedPorts: Map<string, any>
  nodeStates: Map<string, NodeState>
}

export interface ZoneState {
  zoneId: string
  expected: number
  received: number
  results: any[]
  iterations: Map<number, ZoneIterationScope>
}

export interface CoordinatorCallbacks {
  onCmd: (event: EwoCloudEvent) => void
  onCompleted: (outputs: Record<string, any>) => void
  onError: (acId: string, error: any) => void
  onForEachComplete?: (zoneId: string, outputRef: string) => void
  onLog?: (message: string) => void
}

export class Coordinator {
  readonly correlationId: string
  readonly wfId: string
  readonly wfDef: { nodes: WfNode[]; forEachZones?: ForEachZone[]; outputs: Record<string, string> }
  readonly inputs: Record<string, any>

  arrivedPorts = new Map<string, any>()
  nodeStates = new Map<string, NodeState>()
  zoneState = new Map<string, ZoneState>()

  private zones: ForEachZone[]
  private allZones: ForEachZone[]
  private zoneNodeSet: Set<string>
  private zoneByNodeId: Map<string, string>
  private childZoneParent: Map<string, string>

  private payloadStore: PayloadStore
  private callbacks: CoordinatorCallbacks
  private _completed = false

  constructor(opts: {
    correlationId: string
    wfId: string
    wfDef: { nodes: WfNode[]; forEachZones?: ForEachZone[]; outputs: Record<string, string> }
    inputs: Record<string, any>
    payloadStore: PayloadStore
    callbacks: CoordinatorCallbacks
  }) {
    this.correlationId = opts.correlationId
    this.wfId = opts.wfId
    this.wfDef = opts.wfDef
    this.inputs = opts.inputs
    this.payloadStore = opts.payloadStore
    this.callbacks = opts.callbacks

    this.zones = opts.wfDef.forEachZones ?? []
    this.allZones = []
    this.zoneNodeSet = new Set()
    this.zoneByNodeId = new Map()
    this.childZoneParent = new Map()
    this.collectAllZones(this.zones, null)

    for (const node of this.wfDef.nodes) {
      this.nodeStates.set(node.id, 'pending')
    }

    this.initArrivedPorts()
  }

  private collectAllZones(zones: ForEachZone[], parentZoneId: string | null): void {
    for (const z of zones) {
      this.allZones.push(z)
      for (const nid of z.nodes) {
        this.zoneNodeSet.add(nid)
        this.zoneByNodeId.set(nid, z.id)
      }
      if (parentZoneId) {
        this.childZoneParent.set(z.id, parentZoneId)
      }
      if (z.childZones) {
        this.collectAllZones(z.childZones, z.id)
      }
    }
  }

  private log(msg: string): void {
    const formatted = `[Coordinator:${this.wfId}] ${msg}`
    console.log(formatted)
    this.callbacks.onLog?.(formatted)
  }

  private initArrivedPorts(): void {
    for (const node of this.wfDef.nodes) {
      if (this.zoneNodeSet.has(node.id)) continue
      for (const [depKey, depSpec] of Object.entries(node.deps)) {
        if (isWfDep(depSpec) && depSpec.sourceAcId === '$input') {
          const value = this.inputs[depSpec.sourcePort]
          this.arrivedPorts.set(`${node.id}.${depKey}`, value)
        } else if (isWfDepLiteral(depSpec)) {
          this.arrivedPorts.set(`${node.id}.${depKey}`, depSpec.literal)
        }
      }
    }
  }

  private findZone(zoneId: string): ForEachZone | undefined {
    const compound = this.parseCompoundZoneId(zoneId)
    const actualId = compound ? compound.childZoneId : zoneId
    return this.allZones.find(z => z.id === actualId)
  }

  private findEntryNodes(zone: ForEachZone): WfNode[] {
    return this.wfDef.nodes.filter(n =>
      zone.nodes.includes(n.id)
      && Object.values(n.deps).some(d => isWfDep(d) && d.sourceAcId === '$zoneInput')
    )
  }

  start(): void {
    this.log(`Started with inputs: ${JSON.stringify(this.inputs)}`)
    this.readyLoop()
  }

  // --- Main workflow readyLoop (skips zone nodes) ---

  readyLoop(): void {
    if (this._completed) return

    const readyNodes: WfNode[] = []
    const skippedByGuard: WfNode[] = []

    for (const node of this.wfDef.nodes) {
      if (this.zoneNodeSet.has(node.id)) continue
      const state = this.nodeStates.get(node.id)
      if (state !== 'pending') continue
      if (!this.allDepsSatisfied(node)) continue

      if (node.guard) {
        const payload = this.assemblePayload(node)
        const guardResult = evaluateGuard(node.guard, payload)
        if (!guardResult) {
          skippedByGuard.push(node)
          continue
        }
      }

      readyNodes.push(node)
    }

    for (const node of skippedByGuard) {
      this.nodeStates.set(node.id, 'skipped')
      this.log(`${node.id} → skipped (guard: ${node.guard})`)
      this.propagateSkip(node.id)
    }

    if (readyNodes.length === 0) {
      if (skippedByGuard.length > 0) this.checkCompletion()
      return
    }

    this.log(`readyLoop: ready=[${readyNodes.map(n => n.id).join(', ')}]`)

    for (const node of readyNodes) {
      this.nodeStates.set(node.id, 'running')
      const payload = this.assemblePayload(node)

      const data: Record<string, any> = { operation: node.operation, payload }
      if (node.wfCall) {
        data.wfCall = node.wfCall
      }

      const cmdEvent = createCloudEvent({
        type: `${node.id}.cmd`,
        source: `urn:wf:${this.wfId}`,
        correlationid: this.correlationId,
        acid: node.id,
        data,
      })
      this.log(`Dispatching ${node.id}.cmd (${node.operation})`)
      this.callbacks.onCmd(cmdEvent)
    }
  }

  // --- Zone methods ---

  notifyZoneInput(zoneId: string, collection: any[]): void {
    const zone = this.findZone(zoneId)
    if (!zone) {
      this.log(`notifyZoneInput: unknown zone ${zoneId}`)
      return
    }

    const N = collection.length
    this.log(`Zone ${zoneId}: ${N} items → dispatching iterations`)

    const state: ZoneState = {
      zoneId,
      expected: N,
      received: 0,
      results: new Array(N),
      iterations: new Map(),
    }
    this.zoneState.set(zoneId, state)

    if (N === 0) {
      this.completeZone(zoneId)
      return
    }

    for (let i = 0; i < N; i++) {
      const iterState: ZoneIterationScope = {
        arrivedPorts: new Map(),
        nodeStates: new Map(),
      }
      for (const nodeId of zone.nodes) {
        iterState.nodeStates.set(nodeId, 'pending')
      }

      const entryNodes = this.findEntryNodes(zone)
      for (const entryNode of entryNodes) {
        for (const [depKey, dep] of Object.entries(entryNode.deps)) {
          if (isWfDep(dep) && dep.sourceAcId === '$zoneInput') {
            iterState.arrivedPorts.set(`${entryNode.id}.${depKey}`, collection[i])
          }
          if (isWfDepLiteral(dep)) {
            iterState.arrivedPorts.set(`${entryNode.id}.${depKey}`, dep.literal)
          }
        }
      }

      state.iterations.set(i, iterState)
    }

    for (let i = 0; i < N; i++) {
      this.zoneReadyLoop(zoneId, i)
    }
  }

  notifyChildZoneInput(
    parentZoneId: string,
    parentIterationId: number,
    childZoneId: string,
    collection: any[],
  ): void {
    const compoundKey = `${parentZoneId}:${parentIterationId}:${childZoneId}`
    this.log(`ChildZone ${compoundKey}: ${collection.length} items`)
    this.notifyZoneInput(compoundKey, collection)
  }

  zoneReadyLoop(zoneId: string, iterationId: number): void {
    const state = this.zoneState.get(zoneId)
    if (!state) return
    const iterState = state.iterations.get(iterationId)
    if (!iterState) return
    const zone = this.findZone(zoneId)
    if (!zone) return

    const readyNodes: WfNode[] = []

    for (const nodeId of zone.nodes) {
      const ns = iterState.nodeStates.get(nodeId)
      if (ns !== 'pending') continue

      const node = this.wfDef.nodes.find(n => n.id === nodeId)
      if (!node) continue

      if (!this.zoneAllDepsSatisfied(node, iterState)) continue
      readyNodes.push(node)
    }

    if (readyNodes.length === 0) return

    this.log(`Zone ${zoneId} iter ${iterationId}: ready=[${readyNodes.map(n => n.id).join(', ')}]`)

    for (const node of readyNodes) {
      iterState.nodeStates.set(node.id, 'running')
      const payload = this.zoneAssemblePayload(node, iterState)

      const data: Record<string, any> = { operation: node.operation, payload, zoneId }
      if (node.wfCall) {
        data.wfCall = node.wfCall
      }

      const cmdEvent = createCloudEvent({
        type: `${node.id}.cmd`,
        source: `urn:wf:${this.wfId}`,
        correlationid: this.correlationId,
        acid: node.id,
        iterationid: iterationId,
        data,
      })
      this.log(`Zone ${zoneId} iter ${iterationId}: Dispatching ${node.id}.cmd`)
      this.callbacks.onCmd(cmdEvent)
    }
  }

  private zoneAllDepsSatisfied(node: WfNode, iterState: ZoneIterationScope): boolean {
    for (const [depKey] of Object.entries(node.deps)) {
      if (!iterState.arrivedPorts.has(`${node.id}.${depKey}`)) return false
    }
    return true
  }

  private zoneAssemblePayload(node: WfNode, iterState: ZoneIterationScope): Record<string, any> {
    const payload: Record<string, any> = {}
    for (const [depKey] of Object.entries(node.deps)) {
      payload[depKey] = iterState.arrivedPorts.get(`${node.id}.${depKey}`)
    }
    return payload
  }

  notifyZonePortArrival(zoneId: string, iterationId: number, targetNodeId: string, depKey: string, value: any): void {
    const state = this.zoneState.get(zoneId)
    if (!state) return
    const iterState = state.iterations.get(iterationId)
    if (!iterState) return

    iterState.arrivedPorts.set(`${targetNodeId}.${depKey}`, value)
    this.log(`Zone ${zoneId} iter ${iterationId}: ${targetNodeId}.${depKey} arrived`)
    this.zoneReadyLoop(zoneId, iterationId)
  }

  markZoneNodeDone(zoneId: string, nodeId: string, iterationId: number): void {
    const state = this.zoneState.get(zoneId)
    if (!state) return
    const iterState = state.iterations.get(iterationId)
    if (!iterState) return

    iterState.nodeStates.set(nodeId, 'done')
    this.log(`Zone ${zoneId} iter ${iterationId}: ${nodeId} → done`)

    const zone = this.findZone(zoneId)
    if (!zone) return

    if (nodeId === zone.outputNodeId) {
      const ref = this.payloadStore.makeRef(this.correlationId, `${nodeId}:${zoneId}:${iterationId}`)
      const result = this.payloadStore.get(ref)
      state.results[iterationId] = result?.[zone.outputPort]
      state.received++

      this.log(`Zone ${zoneId}: iteration ${iterationId} output collected (${state.received}/${state.expected})`)

      if (state.received === state.expected) {
        this.completeZone(zoneId)
      }
    }
  }

  private completeZone(zoneId: string): void {
    const state = this.zoneState.get(zoneId)
    if (!state) return

    const compoundParts = this.parseCompoundZoneId(zoneId)
    const actualZoneId = compoundParts ? compoundParts.childZoneId : zoneId
    const zone = this.findZone(actualZoneId)
    if (!zone) return

    const collected = state.results
    const ref = this.payloadStore.makeRef(this.correlationId, `$zone:${zoneId}`)
    this.payloadStore.set(ref, { [zone.outputCollection]: collected })

    this.log(`Zone ${zoneId} complete: ${collected.length} items → ${zone.outputCollection}`)

    if (compoundParts) {
      const { parentZoneId, parentIterationId } = compoundParts
      const parentState = this.zoneState.get(parentZoneId)
      if (parentState) {
        const parentIterState = parentState.iterations.get(parentIterationId)
        if (parentIterState) {
          for (const node of this.wfDef.nodes) {
            for (const [depKey, dep] of Object.entries(node.deps)) {
              if (isWfDep(dep) && dep.sourceAcId === `$zone:${actualZoneId}`) {
                parentIterState.arrivedPorts.set(`${node.id}.${depKey}`, collected)
                this.log(`ChildZone ${zoneId} → parent iter ${parentIterationId}: ${node.id}.${depKey} arrived`)
              }
            }
          }
          this.zoneReadyLoop(parentZoneId, parentIterationId)
        }
      }
    } else {
      if (this.callbacks.onForEachComplete) {
        this.callbacks.onForEachComplete(zoneId, ref)
      }
    }
  }

  private parseCompoundZoneId(zoneId: string): { parentZoneId: string; parentIterationId: number; childZoneId: string } | null {
    const parts = zoneId.split(':')
    if (parts.length >= 3) {
      const parentIterationId = parseInt(parts[parts.length - 2], 10)
      if (!isNaN(parentIterationId)) {
        return {
          parentZoneId: parts.slice(0, -2).join(':'),
          parentIterationId,
          childZoneId: parts[parts.length - 1],
        }
      }
    }
    return null
  }

  // --- Normal node state management ---

  private propagateSkip(skippedNodeId: string): void {
    for (const node of this.wfDef.nodes) {
      if (this.zoneNodeSet.has(node.id)) continue
      if (this.nodeStates.get(node.id) !== 'pending') continue

      let hasUnsatisfiableDep = false
      for (const [, depSpec] of Object.entries(node.deps)) {
        if (isWfDep(depSpec) && depSpec.sourceAcId === skippedNodeId) {
          hasUnsatisfiableDep = true
          break
        }
        if (isWfDepOneOf(depSpec)) {
          const allSkipped = depSpec.oneOf.every(alt => {
            const state = this.nodeStates.get(alt.sourceAcId)
            return state === 'skipped'
          })
          if (allSkipped) {
            hasUnsatisfiableDep = true
            break
          }
        }
      }

      if (hasUnsatisfiableDep) {
        this.nodeStates.set(node.id, 'skipped')
        this.log(`${node.id} → skipped (cascade from ${skippedNodeId})`)
        this.propagateSkip(node.id)
      }
    }
  }

  private allDepsSatisfied(node: WfNode): boolean {
    for (const [depKey, depSpec] of Object.entries(node.deps)) {
      if (isWfDepOneOf(depSpec)) {
        const hasAny = depSpec.oneOf.some(alt =>
          this.arrivedPorts.has(`${node.id}.${depKey}:${alt.sourceAcId}.${alt.sourcePort}`)
        )
        if (!hasAny) return false
      } else {
        if (!this.arrivedPorts.has(`${node.id}.${depKey}`)) return false
      }
    }
    return true
  }

  private assemblePayload(node: WfNode): Record<string, any> {
    const payload: Record<string, any> = {}
    for (const [depKey, depSpec] of Object.entries(node.deps)) {
      if (isWfDepOneOf(depSpec)) {
        for (const alt of depSpec.oneOf) {
          const key = `${node.id}.${depKey}:${alt.sourceAcId}.${alt.sourcePort}`
          if (this.arrivedPorts.has(key)) {
            payload[depKey] = this.arrivedPorts.get(key)
            break
          }
        }
      } else {
        payload[depKey] = this.arrivedPorts.get(`${node.id}.${depKey}`)
      }
    }
    return payload
  }

  markDone(acId: string): void {
    this.nodeStates.set(acId, 'done')
    this.log(`${acId} → done`)
    this.checkCompletion()
  }

  notifyPortArrival(targetNodeId: string, depKey: string, value: any): void {
    this.arrivedPorts.set(`${targetNodeId}.${depKey}`, value)
    this.readyLoop()
  }

  notifyOneOfPortArrival(targetNodeId: string, depKey: string, sourceAcId: string, sourcePort: string, value: any): void {
    this.arrivedPorts.set(`${targetNodeId}.${depKey}:${sourceAcId}.${sourcePort}`, value)
    this.readyLoop()
  }

  handleAcError(acId: string, error: any): void {
    this.nodeStates.set(acId, 'error')
    this.log(`${acId} error: ${error}`)
    this.callbacks.onError(acId, error)
  }

  private checkCompletion(): void {
    const allNormalDone = this.wfDef.nodes.every(node => {
      if (this.zoneNodeSet.has(node.id)) return true
      const state = this.nodeStates.get(node.id)
      return state === 'done' || state === 'skipped'
    })

    const allZonesDone = this.zones.every(z => {
      const state = this.zoneState.get(z.id)
      return state != null && state.received === state.expected
    })
    // Child zones are tracked via compound keys, not checked at top level

    if (allNormalDone && allZonesDone) {
      this._completed = true
      const outputs = this.resolveOutputs()
      this.log(`Workflow completed: ${JSON.stringify(outputs)}`)
      this.callbacks.onCompleted(outputs)
    } else {
      this.readyLoop()
    }
  }

  private resolveOutputs(): Record<string, any> {
    const outputs: Record<string, any> = {}
    for (const [key, ref] of Object.entries(this.wfDef.outputs)) {
      const dotIdx = ref.indexOf('.')
      if (dotIdx === -1) continue
      const acId = ref.substring(0, dotIdx)
      const port = ref.substring(dotIdx + 1)
      const storeRef = this.payloadStore.makeRef(this.correlationId, acId)
      const result = this.payloadStore.get(storeRef)
      outputs[key] = result?.[port]
    }
    return outputs
  }
}
