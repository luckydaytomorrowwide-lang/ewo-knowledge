import type { EwoJson, ForEachZone } from '../types'
import { isWfDep, isWfDepOneOf } from '../types'
import type { EwoCloudEvent } from './cloudEvent'
import { createCloudEvent } from './cloudEvent'
import { EventBus, AnswerBus } from './eventBus'
import { PayloadStore } from './payloadStore'
import { Coordinator } from './coordinator'
import { Mediator } from './mediator'
import { executeAc } from './acWorker'
import type { WfRegistry } from './registry'
import { expandInlineWfCalls } from './inlineExpander'

let _corrCounter = 0
function generateCorrelationId(): string {
  return `corr-${Date.now().toString(36)}-${++_corrCounter}`
}

export interface LaunchResult {
  correlationId: string
  status: 'completed' | 'failed'
  outputs?: Record<string, any>
  error?: string
}

export interface LaunchObserver {
  onCorrelationId?: (id: string) => void
  onNodeStateChange?: (acId: string, state: string) => void
  onPortArrival?: (key: string, value: any) => void
  onEvent?: (bus: string, event: EwoCloudEvent) => void
}

export interface LaunchOptions {
  registry?: WfRegistry
}

export async function launchWorkflow(
  ewoJson: EwoJson,
  inputs: Record<string, any>,
  options?: LaunchOptions,
): Promise<LaunchResult> {
  return launchWorkflowObservable(ewoJson, inputs, undefined, options)
}

function parseEventType(type: string): [string, string] {
  const dotIdx = type.indexOf('.')
  if (dotIdx === -1) return ['', '']
  return [type.substring(0, dotIdx), type.substring(dotIdx + 1)]
}

export async function launchWorkflowObservable(
  ewoJson: EwoJson,
  inputs: Record<string, any>,
  observer?: LaunchObserver,
  options?: LaunchOptions,
): Promise<LaunchResult> {
  const registry = options?.registry
  const correlationId = generateCorrelationId()
  const wfId = ewoJson.id

  observer?.onCorrelationId?.(correlationId)

  console.log(`[Launcher] Starting ${wfId} (${correlationId})`)
  console.log(`[Launcher] Inputs: ${JSON.stringify(inputs)}`)

  // --- Inline expansion (boundary=false) ---
  let effectiveWfDef = ewoJson.wfDef
  let effectiveWiring = ewoJson.wiring

  const hasInlineWfCalls = ewoJson.wfDef.nodes.some(
    n => n.wfCall && n.wfCall.boundary === false,
  )
  if (hasInlineWfCalls && registry) {
    console.log(`[Launcher] Detected inline wfCall(boundary=false) — expanding...`)
    const expanded = expandInlineWfCalls(ewoJson, registry)
    effectiveWfDef = expanded.wfDef
    effectiveWiring = expanded.wiring
    console.log(
      `[Launcher] Expansion complete: ${effectiveWfDef.nodes.length} nodes, ${effectiveWiring.routes.length} routes`,
    )
  }

  const payloadStore = new PayloadStore()
  const answerBus = new AnswerBus()
  const requestBus = new EventBus(`RequestBus:${wfId}`)

  if (observer?.onEvent) {
    const cb = observer.onEvent
    answerBus.subscribe((e) => cb('AnswerBus', e))
    requestBus.subscribe((e) => cb(`RequestBus:${wfId}`, e))
  }

  const mediator = new Mediator(effectiveWiring, requestBus)
  mediator.attachToAnswerBus(answerBus)

  return new Promise<LaunchResult>((resolve) => {
    let resolved = false

    const coordinator = new Coordinator({
      correlationId,
      wfId,
      wfDef: effectiveWfDef,
      inputs,
      payloadStore,
      callbacks: {
        onCmd: (cmdEvent: EwoCloudEvent) => {
          observer?.onNodeStateChange?.(cmdEvent.acid!, 'running')
          const wfCallData = cmdEvent.data?.wfCall
          if (wfCallData && wfCallData.boundary === true && registry) {
            launchChildWorkflow(
              cmdEvent, payloadStore, answerBus, registry, correlationId, observer,
            )
          } else {
            executeAc(cmdEvent, payloadStore, answerBus)
          }
        },
        onCompleted: (outputs: Record<string, any>) => {
          if (resolved) return
          resolved = true
          console.log(`[Launcher] Workflow ${wfId} completed`)
          console.log(`[Launcher] Outputs: ${JSON.stringify(outputs, null, 2)}`)
          resolve({ correlationId, status: 'completed', outputs })
        },
        onError: (acId: string, error: any) => {
          if (resolved) return
          resolved = true
          observer?.onNodeStateChange?.(acId, 'error')
          console.error(`[Launcher] Workflow ${wfId} failed at ${acId}: ${error}`)
          resolve({ correlationId, status: 'failed', error: `${acId}: ${error}` })
        },
        onForEachComplete: (zoneId: string, outputRef: string) => {
          const synthesized = createCloudEvent({
            type: `$zone:${zoneId}.done`,
            source: `urn:wf:${wfId}`,
            correlationid: correlationId,
            acid: `$zone:${zoneId}`,
            data: { outputRef },
          })
          console.log(`[Launcher] Zone ${zoneId} complete → synthesized $zone:${zoneId}.done`)
          answerBus.publish(synthesized)
        },
        onLog: (msg: string) => {
          // forwarded by coordinator itself
        },
      },
    })

    // --- AnswerBus handler ---
    answerBus.subscribe((event) => {
      if (event.correlationid !== correlationId) return

      if (event.type.endsWith('.done')) {
        const acId = event.acid!
        const zoneId = event.data?.zoneId
        const iterationId = event.iterationid

        if (zoneId != null && iterationId != null) {
          coordinator.markZoneNodeDone(zoneId, acId, iterationId)
          observer?.onNodeStateChange?.(acId, 'done')
          return
        }

        coordinator.markDone(acId)
        observer?.onNodeStateChange?.(acId, 'done')

        const ref = event.data?.outputRef
        if (ref) {
          const result = payloadStore.get(ref)
          if (result) {
            console.log(`[Launcher] ${acId} result: ${JSON.stringify(result)}`)
          }
        }
      } else if (event.type.endsWith('.error')) {
        coordinator.handleAcError(event.acid!, event.data?.error)
        observer?.onNodeStateChange?.(event.acid!, 'error')
      }
    })

    // --- RequestBus handler ---
    requestBus.subscribe((event) => {
      // Zone input event: $zone:ZoneId.input
      if (event.type.startsWith('$zone:') && event.type.endsWith('.input')) {
        const zoneId = event.type.slice(6, -6)
        const payloadRef = event.data?.payloadRef
        const fullResult = payloadRef ? payloadStore.get(payloadRef) : undefined
        const zone = findZoneRecursive(effectiveWfDef.forEachZones ?? [], zoneId)
        if (zone && fullResult) {
          const collection = fullResult[zone.collectionSource.sourcePort]
          if (!Array.isArray(collection)) {
            console.error(`[Launcher] Zone ${zoneId}: collection is not an array`, collection)
            return
          }

          const parentZoneId = event.data?.zoneId
          const parentIterationId = event.iterationid
          if (parentZoneId != null && parentIterationId != null) {
            console.log(`[Launcher] ChildZone ${zoneId} input (parent ${parentZoneId}:${parentIterationId}): ${collection.length} items`)
            coordinator.notifyChildZoneInput(parentZoneId, parentIterationId, zoneId, collection)
          } else {
            console.log(`[Launcher] Zone ${zoneId} input: ${collection.length} items`)
            coordinator.notifyZoneInput(zoneId, collection)
          }
        }
        return
      }

      if (event.type.endsWith('.cmd')) return
      if (event.type === 'wf.completed') return

      const [targetNodeId, depKey] = parseEventType(event.type)
      if (!targetNodeId || !depKey) return

      // Zone-internal routing: iterationid + zoneId present
      const zoneId = event.data?.zoneId
      const iterationId = event.iterationid

      if (zoneId != null && iterationId != null) {
        const payloadRef = event.data?.payloadRef
        const fullResult = payloadRef ? payloadStore.get(payloadRef) : undefined
        const node = effectiveWfDef.nodes.find(n => n.id === targetNodeId)
        if (!node) return
        const depSpec = node.deps[depKey]
        const value = (depSpec && isWfDep(depSpec)) ? fullResult?.[depSpec.sourcePort] : fullResult
        coordinator.notifyZonePortArrival(zoneId, iterationId, targetNodeId, depKey, value)
        observer?.onPortArrival?.(`${targetNodeId}.${depKey}[zone:${zoneId},iter:${iterationId}]`, value)
        return
      }

      // Normal port arrival
      const node = effectiveWfDef.nodes.find(n => n.id === targetNodeId)
      if (!node) return

      const depSpec = node.deps[depKey]
      if (!depSpec) return

      const payloadRef = event.data?.payloadRef
      if (!payloadRef) return

      const fullResult = payloadStore.get(payloadRef)

      if (isWfDep(depSpec)) {
        const value = fullResult?.[depSpec.sourcePort]
        coordinator.notifyPortArrival(targetNodeId, depKey, value)
        observer?.onPortArrival?.(`${targetNodeId}.${depKey}`, value)
      } else if (isWfDepOneOf(depSpec)) {
        for (const alt of depSpec.oneOf) {
          const altRef = payloadStore.makeRef(correlationId, alt.sourceAcId)
          if (payloadRef === altRef) {
            coordinator.notifyOneOfPortArrival(
              targetNodeId, depKey, alt.sourceAcId, alt.sourcePort,
              fullResult?.[alt.sourcePort],
            )
            observer?.onPortArrival?.(`${targetNodeId}.${depKey}:${alt.sourceAcId}.${alt.sourcePort}`, fullResult?.[alt.sourcePort])
            break
          }
        }
      }
    })

    for (const node of effectiveWfDef.nodes) {
      observer?.onNodeStateChange?.(node.id, 'pending')
    }

    coordinator.start()
  })
}

async function launchChildWorkflow(
  parentCmdEvent: EwoCloudEvent,
  parentPayloadStore: PayloadStore,
  parentAnswerBus: AnswerBus,
  registry: WfRegistry,
  parentCorrelationId: string,
  observer?: LaunchObserver,
): Promise<void> {
  const callNodeId = parentCmdEvent.acid!
  const wfCallData = parentCmdEvent.data?.wfCall
  const callee = wfCallData?.callee as string

  console.log(`[Supervisor] wfCall(boundary=true) detected: ${callNodeId} → ${callee}`)

  const entry = registry.lookup(callee)
  if (!entry) {
    console.error(`[Supervisor] callee "${callee}" not found in registry`)
    parentAnswerBus.publish(createCloudEvent({
      type: `${callNodeId}.error`,
      source: `urn:supervisor:${callee}`,
      correlationid: parentCorrelationId,
      acid: callNodeId,
      data: { error: `callee "${callee}" not found in registry` },
    }))
    return
  }

  const childEwoJson = entry.ewoJson
  const childInputs = parentCmdEvent.data?.payload ?? {}
  const childCorrelationId = `${parentCorrelationId}:${callNodeId}`
  const parentZoneId = parentCmdEvent.data?.zoneId
  const parentIterationId = parentCmdEvent.iterationid

  // Recursion depth check
  const maxDepth = wfCallData?.policy?.maxRecursionDepth ?? 20
  const currentDepth = childCorrelationId.split(':').length - 1
  if (currentDepth > maxDepth) {
    const errMsg = `Recursion depth ${currentDepth} exceeds max ${maxDepth} for callee "${callee}"`
    console.error(`[Supervisor] ${errMsg}`)
    const errData: Record<string, any> = { error: errMsg }
    if (parentZoneId != null) errData.zoneId = parentZoneId
    parentAnswerBus.publish(createCloudEvent({
      type: `${callNodeId}.error`,
      source: `urn:supervisor:${callee}`,
      correlationid: parentCorrelationId,
      acid: callNodeId,
      iterationid: parentIterationId,
      data: errData,
    }))
    return
  }

  console.log(`[Supervisor] Launching child WF "${callee}" (${childCorrelationId}) depth=${currentDepth}${parentZoneId != null ? ` [zone:${parentZoneId},iter:${parentIterationId}]` : ''}`)

  const childAnswerBus = new AnswerBus()
  const childRequestBus = new EventBus(`RequestBus:${callee}`)

  if (observer?.onEvent) {
    const cb = observer.onEvent
    childAnswerBus.subscribe((e) => cb(`AnswerBus:${callee}`, e))
    childRequestBus.subscribe((e) => cb(`RequestBus:${callee}`, e))
  }

  const childMediator = new Mediator(childEwoJson.wiring, childRequestBus)
  childMediator.attachToAnswerBus(childAnswerBus)

  const childCoordinator = new Coordinator({
    correlationId: childCorrelationId,
    wfId: callee,
    wfDef: childEwoJson.wfDef,
    inputs: childInputs,
    payloadStore: parentPayloadStore,
    callbacks: {
      onCmd: (cmdEvent: EwoCloudEvent) => {
        observer?.onNodeStateChange?.(`${callee}/${cmdEvent.acid!}`, 'running')
        const childWfCall = cmdEvent.data?.wfCall
        if (childWfCall && childWfCall.boundary === true && registry) {
          launchChildWorkflow(
            cmdEvent, parentPayloadStore, childAnswerBus, registry, childCorrelationId, observer,
          )
        } else {
          executeAc(cmdEvent, parentPayloadStore, childAnswerBus)
        }
      },
      onCompleted: (outputs: Record<string, any>) => {
        console.log(`[Supervisor] Child WF "${callee}" completed: ${JSON.stringify(outputs)}`)

        const storeKey = parentZoneId != null
          ? `${callNodeId}:${parentZoneId}:${parentIterationId}`
          : callNodeId
        const ref = parentPayloadStore.makeRef(parentCorrelationId, storeKey)
        parentPayloadStore.set(ref, outputs)

        const doneData: Record<string, any> = { outputRef: ref }
        if (parentZoneId != null) doneData.zoneId = parentZoneId

        parentAnswerBus.publish(createCloudEvent({
          type: `${callNodeId}.done`,
          source: `urn:wf:${callee}`,
          correlationid: parentCorrelationId,
          acid: callNodeId,
          iterationid: parentIterationId,
          data: doneData,
        }))
      },
      onError: (acId: string, error: any) => {
        console.error(`[Supervisor] Child WF "${callee}" failed at ${acId}: ${error}`)
        observer?.onNodeStateChange?.(`${callee}/${acId}`, 'error')

        const errData: Record<string, any> = { error: `Child WF "${callee}" failed at ${acId}: ${error}` }
        if (parentZoneId != null) errData.zoneId = parentZoneId

        parentAnswerBus.publish(createCloudEvent({
          type: `${callNodeId}.error`,
          source: `urn:wf:${callee}`,
          correlationid: parentCorrelationId,
          acid: callNodeId,
          iterationid: parentIterationId,
          data: errData,
        }))
      },
      onForEachComplete: (zoneId: string, outputRef: string) => {
        const synthesized = createCloudEvent({
          type: `$zone:${zoneId}.done`,
          source: `urn:wf:${callee}`,
          correlationid: childCorrelationId,
          acid: `$zone:${zoneId}`,
          data: { outputRef },
        })
        childAnswerBus.publish(synthesized)
      },
      onLog: (_msg: string) => {},
    },
  })

  // Child AnswerBus handler
  childAnswerBus.subscribe((event) => {
    if (event.correlationid !== childCorrelationId) return

    if (event.type.endsWith('.done')) {
      const acId = event.acid!
      const zoneId = event.data?.zoneId
      const iterationId = event.iterationid

      if (zoneId != null && iterationId != null) {
        childCoordinator.markZoneNodeDone(zoneId, acId, iterationId)
        observer?.onNodeStateChange?.(`${callee}/${acId}`, 'done')
        return
      }

      childCoordinator.markDone(acId)
      observer?.onNodeStateChange?.(`${callee}/${acId}`, 'done')
    } else if (event.type.endsWith('.error')) {
      childCoordinator.handleAcError(event.acid!, event.data?.error)
      observer?.onNodeStateChange?.(`${callee}/${event.acid!}`, 'error')
    }
  })

  // Child RequestBus handler
  childRequestBus.subscribe((event) => {
    if (event.type.startsWith('$zone:') && event.type.endsWith('.input')) {
      const zoneId = event.type.slice(6, -6)
      const payloadRef = event.data?.payloadRef
      const fullResult = payloadRef ? parentPayloadStore.get(payloadRef) : undefined
      const zone = childEwoJson.wfDef.forEachZones?.find(z => z.id === zoneId)
      if (zone && fullResult) {
        const collection = fullResult[zone.collectionSource.sourcePort]
        if (Array.isArray(collection)) {
          childCoordinator.notifyZoneInput(zoneId, collection)
        }
      }
      return
    }

    if (event.type.endsWith('.cmd')) return
    if (event.type === 'wf.completed') return

    const dotIdx = event.type.indexOf('.')
    if (dotIdx === -1) return
    const targetNodeId = event.type.substring(0, dotIdx)
    const depKey = event.type.substring(dotIdx + 1)

    const zoneId = event.data?.zoneId
    const iterationId = event.iterationid

    if (zoneId != null && iterationId != null) {
      const payloadRef = event.data?.payloadRef
      const fullResult = payloadRef ? parentPayloadStore.get(payloadRef) : undefined
      const node = childEwoJson.wfDef.nodes.find(n => n.id === targetNodeId)
      if (!node) return
      const depSpec = node.deps[depKey]
      const value = (depSpec && isWfDep(depSpec)) ? fullResult?.[depSpec.sourcePort] : fullResult
      childCoordinator.notifyZonePortArrival(zoneId, iterationId, targetNodeId, depKey, value)
      return
    }

    const node = childEwoJson.wfDef.nodes.find(n => n.id === targetNodeId)
    if (!node) return
    const depSpec = node.deps[depKey]
    if (!depSpec) return

    const payloadRef = event.data?.payloadRef
    if (!payloadRef) return
    const fullResult = parentPayloadStore.get(payloadRef)

    if (isWfDep(depSpec)) {
      const value = fullResult?.[depSpec.sourcePort]
      childCoordinator.notifyPortArrival(targetNodeId, depKey, value)
    } else if (isWfDepOneOf(depSpec)) {
      for (const alt of depSpec.oneOf) {
        const altRef = parentPayloadStore.makeRef(childCorrelationId, alt.sourceAcId)
        if (payloadRef === altRef) {
          childCoordinator.notifyOneOfPortArrival(
            targetNodeId, depKey, alt.sourceAcId, alt.sourcePort,
            fullResult?.[alt.sourcePort],
          )
          break
        }
      }
    }
  })

  for (const node of childEwoJson.wfDef.nodes) {
    observer?.onNodeStateChange?.(`${callee}/${node.id}`, 'pending')
  }

  childCoordinator.start()
}

function findZoneRecursive(zones: ForEachZone[], zoneId: string): ForEachZone | undefined {
  for (const z of zones) {
    if (z.id === zoneId) return z
    if (z.childZones) {
      const found = findZoneRecursive(z.childZones, zoneId)
      if (found) return found
    }
  }
  return undefined
}
