import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { EwoJson } from '~/utils/ewo/types'
import { launchWorkflowObservable } from '~/utils/ewo/engine/launcher'
import type { LaunchResult, LaunchOptions } from '~/utils/ewo/engine/launcher'
import type { WfRegistry } from '~/utils/ewo/engine/registry'

export const useEwoEngineStore = defineStore('ewoEngine', () => {
  const status = ref<'idle' | 'running' | 'completed' | 'failed'>('idle')
  const lastResult = ref<LaunchResult | null>(null)

  const correlationId = ref('')
  const nodeStates = reactive<Record<string, string>>({})
  const arrivedPorts = reactive<Record<string, any>>({})
  const eventLog = ref<Array<{ bus: string; type: string; time: string; acid?: string; data?: string }>>([])

  const registry = ref<WfRegistry | undefined>(undefined)

  function setRegistry(reg: WfRegistry): void {
    registry.value = reg
  }

  async function run(ewoJson: EwoJson, inputs: Record<string, any>): Promise<LaunchResult> {
    status.value = 'running'
    lastResult.value = null
    correlationId.value = ''
    Object.keys(nodeStates).forEach(k => delete nodeStates[k])
    Object.keys(arrivedPorts).forEach(k => delete arrivedPorts[k])
    eventLog.value = []

    try {
      const launchOpts: LaunchOptions = {}
      if (registry.value) launchOpts.registry = registry.value
      const result = await launchWorkflowObservable(ewoJson, inputs, {
        onCorrelationId: (id) => {
          correlationId.value = id
        },
        onNodeStateChange: (acId, state) => {
          nodeStates[acId] = state
        },
        onPortArrival: (key, value) => {
          arrivedPorts[key] = typeof value === 'object' ? JSON.stringify(value) : value
        },
        onEvent: (bus, event) => {
          eventLog.value.push({
            bus,
            type: event.type,
            time: event.time,
            acid: event.acid,
            data: event.data ? JSON.stringify(event.data).slice(0, 200) : undefined,
          })
        },
      }, launchOpts)

      status.value = result.status === 'completed' ? 'completed' : 'failed'
      lastResult.value = result
      return result
    } catch (err: any) {
      status.value = 'failed'
      const result: LaunchResult = {
        correlationId: correlationId.value || 'unknown',
        status: 'failed',
        error: err.message,
      }
      lastResult.value = result
      return result
    }
  }

  function reset(): void {
    status.value = 'idle'
    lastResult.value = null
    correlationId.value = ''
    Object.keys(nodeStates).forEach(k => delete nodeStates[k])
    Object.keys(arrivedPorts).forEach(k => delete arrivedPorts[k])
    eventLog.value = []
  }

  return {
    status,
    lastResult,
    correlationId,
    nodeStates,
    arrivedPorts,
    eventLog,
    registry,
    setRegistry,
    run,
    reset,
  }
})
