<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">EWO Workflow Runner</h1>
      <NuxtLink
        to="/ewo-authoring"
        class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-sm"
      >
        Open EWO Workflow Authoring Tool
      </NuxtLink>
    </div>

    <!-- Quick Load Section -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 class="font-semibold text-blue-900 mb-3">Load EWO Workflow</h3>
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <button
          @click="triggerFileUpload"
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
        >
          Upload .ewo.json
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          @change="handleFileUpload"
          class="hidden"
        />
        <div class="border-l border-blue-300 mx-1 h-8"></div>
        <select
          v-model="selectedDemoPath"
          class="border border-indigo-300 rounded py-1.5 px-3 text-sm bg-white focus:border-indigo-500 focus:outline-none min-w-[280px]"
        >
          <option value="" disabled>-- Select Demo Workflow --</option>
          <option v-for="dw in demoWorkflows" :key="dw.path" :value="dw.path">
            {{ dw.name }}
          </option>
        </select>
        <button
          @click="loadSelectedDemo"
          class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 px-4 rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!selectedDemoPath"
        >
          Load
        </button>
      </div>
      <p class="text-xs text-blue-700">
        Export .ewo.json from the EWO Authoring Tool, then upload it here to execute.
      </p>
    </div>

    <!-- Two-Column Grid -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <!-- Input JSON -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Input JSON</h2>
        <textarea
          v-model="inputJsonText"
          class="w-full h-[400px] bg-gray-100 p-4 rounded text-xs font-mono overflow-auto border border-gray-300 focus:border-blue-500 focus:outline-none"
          placeholder='{ "imageUrl": "photo.png" }'
          @input="validateInputJson"
        ></textarea>
        <div v-if="inputJsonError" class="text-red-500 text-sm mt-1">
          {{ inputJsonError }}
        </div>
      </div>

      <!-- EWO Workflow Definition JSON -->
      <div>
        <h2 class="text-lg font-semibold mb-2">EWO Workflow Definition</h2>
        <textarea
          v-model="workflowDefText"
          class="w-full h-[400px] bg-gray-100 p-4 rounded text-xs font-mono overflow-auto border border-gray-300 focus:border-blue-500 focus:outline-none"
          placeholder='{ "id": "...", "wfDef": {...}, "wiring": {...} }'
          @input="validateWorkflowDef"
        ></textarea>
        <div v-if="workflowDefError" class="text-red-500 text-sm mt-1">
          {{ workflowDefError }}
        </div>
        <!-- Parsed summary -->
        <div v-if="parsedSummary" class="text-xs text-gray-500 mt-1 font-mono">
          {{ parsedSummary }}
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4 mb-6">
      <button
        @click="runWorkflow"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        :disabled="loading || hasErrors || !engineReady"
      >
        {{ loading ? 'Running...' : 'Run Workflow' }}
      </button>

      <button
        @click="clearAll"
        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
        :disabled="loading"
      >
        Clear All
      </button>

      <span v-if="engineStatus !== 'idle'" class="text-sm font-semibold self-center px-3 py-1 rounded-full" :class="{
        'bg-blue-100 text-blue-800': engineStatus === 'running',
        'bg-green-100 text-green-800': engineStatus === 'completed',
        'bg-red-100 text-red-800': engineStatus === 'failed',
      }">
        {{ engineStatus === 'running' ? 'Engine running...' : engineStatus === 'completed' ? 'Completed' : engineStatus === 'failed' ? 'Failed' : '' }}
      </span>

      <button
        v-if="lastOutputs"
        @click="showOutputModal = true"
        class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded"
      >
        View Outputs
      </button>
    </div>

    <!-- Output Modal -->
    <div
      v-if="showOutputModal && lastOutputs"
      class="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50"
      @click.self="showOutputModal = false"
    >
      <div class="bg-gray-900 rounded-lg shadow-xl w-[90vw] max-w-5xl max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div class="flex items-center gap-3">
            <h3 class="text-white font-semibold text-sm">Workflow Outputs</h3>
            <span class="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
              {{ lastOutputs.status }}
            </span>
            <button
              @click="copyOutputs"
              class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {{ copyLabel }}
            </button>
          </div>
          <button
            @click="showOutputModal = false"
            class="text-gray-400 hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <pre class="text-xs text-green-400 font-mono whitespace-pre">{{ JSON.stringify(lastOutputs.data, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Engine State (nodeStates + arrivedPorts) -->
    <div v-if="Object.keys(ewoEngine.nodeStates).length > 0" class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <h3 class="text-sm font-semibold mb-1">Node States
          <span class="text-xs font-normal bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded ml-1">corr={{ ewoEngine.correlationId }}</span>
        </h3>
        <div class="bg-gray-50 border rounded p-3 text-xs font-mono space-y-1 max-h-[300px] overflow-auto">
          <template v-for="group in groupedNodeStates" :key="group.context">
            <div v-if="group.context !== '__parent__'" class="mt-2 mb-1 px-1 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-semibold rounded">
              Child WF: {{ group.context }}
            </div>
            <div v-for="entry in group.nodes" :key="entry.id" class="flex items-center gap-2" :class="{ 'pl-3': group.context !== '__parent__' }">
              <span class="inline-block w-2 h-2 rounded-full" :class="{
                'bg-gray-400': entry.state === 'pending',
                'bg-blue-500 animate-pulse': entry.state === 'running',
                'bg-green-500': entry.state === 'done',
                'bg-yellow-500': entry.state === 'skipped',
                'bg-red-500': entry.state === 'error',
              }"></span>
              <span class="flex-1 truncate" :class="{ 'text-purple-700': group.context !== '__parent__' }">{{ entry.shortId }}</span>
              <span :class="{
                'text-gray-500': entry.state === 'pending',
                'text-blue-600': entry.state === 'running',
                'text-green-600': entry.state === 'done',
                'text-yellow-600': entry.state === 'skipped',
                'text-red-600': entry.state === 'error',
              }">{{ entry.state }}</span>
            </div>
          </template>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold mb-1">Arrived Ports
          <span class="text-xs font-normal bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded ml-1">{{ Object.keys(ewoEngine.arrivedPorts).length }} entries</span>
        </h3>
        <div class="bg-gray-50 border rounded p-3 text-xs font-mono space-y-1 max-h-[300px] overflow-auto">
          <div v-for="(val, key) in ewoEngine.arrivedPorts" :key="key" class="flex gap-2">
            <span class="text-blue-700 shrink-0">{{ key }}:</span>
            <span class="text-gray-600 truncate">{{ typeof val === 'string' && val.length > 80 ? val.slice(0, 80) + '...' : val }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Log Table -->
    <div v-if="ewoEngine.eventLog.length > 0" class="mb-6">
      <h3 class="text-sm font-semibold mb-1">Event Log
        <span class="text-xs font-normal bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded ml-1">{{ ewoEngine.eventLog.length }} events</span>
      </h3>
      <div class="bg-gray-50 border rounded max-h-[200px] overflow-auto">
        <table class="w-full text-[10px] font-mono">
          <thead class="sticky top-0 bg-gray-200">
            <tr>
              <th class="text-left px-2 py-1">#</th>
              <th class="text-left px-2 py-1">Bus</th>
              <th class="text-left px-2 py-1">Type</th>
              <th class="text-left px-2 py-1">AC ID</th>
              <th class="text-left px-2 py-1">Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(evt, i) in ewoEngine.eventLog" :key="i" class="border-t border-gray-200 hover:bg-gray-100"
              :class="{ 'bg-purple-50': isChildWfEvent(evt.bus) }">
              <td class="px-2 py-0.5 text-gray-400">{{ i + 1 }}</td>
              <td class="px-2 py-0.5" :class="isChildWfEvent(evt.bus) ? 'text-purple-700 font-semibold' : 'text-gray-600'">{{ evt.bus }}</td>
              <td class="px-2 py-0.5 text-blue-700">{{ evt.type }}</td>
              <td class="px-2 py-0.5">{{ evt.acid || '-' }}</td>
              <td class="px-2 py-0.5 text-gray-500 truncate max-w-[200px]">{{ evt.data || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Execution Logs -->
    <div v-if="logs.length > 0" class="mt-4">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Execution Logs
          <span class="text-xs font-normal bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded ml-2">{{ logs.length }} entries</span>
        </h2>
        <button
          @click="clearLogs"
          class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
        >
          Clear Logs
        </button>
      </div>
      <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs h-[600px] overflow-auto whitespace-pre-wrap">
        <div v-for="(log, i) in logs" :key="i" class="mb-2 border-b border-gray-800 pb-2">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { EwoJson } from '~/utils/ewo/types'
import { useEwoEngineStore } from '~/stores/ewoEngine'
import { useRdbStore } from '~/stores/rdb'
import { InMemoryWfRegistry } from '~/utils/ewo/engine/registry'

const ewoEngine = useEwoEngineStore()
const rdbStore = useRdbStore()

const loading = ref(false)
const logs = ref<string[]>([])
const engineReady = ref(true)
const engineStatus = computed(() => ewoEngine.status)

const inputJsonText = ref('')
const workflowDefText = ref('')
const inputJsonError = ref('')
const workflowDefError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const demoWorkflows = ref<Array<{ name: string; path: string; description?: string }>>([])
const selectedDemoPath = ref('')

const lastOutputs = ref<{ status: string; data: any } | null>(null)
const showOutputModal = ref(false)
const copyLabel = ref('Copy to Clipboard')

const hasErrors = computed(() => {
  return !!(inputJsonError.value || workflowDefError.value || !inputJsonText.value.trim() || !workflowDefText.value.trim())
})

const groupedNodeStates = computed(() => {
  const groups = new Map<string, Array<{ id: string; shortId: string; state: string }>>()
  for (const [id, state] of Object.entries(ewoEngine.nodeStates)) {
    const slashIdx = id.indexOf('/')
    let context = '__parent__'
    let shortId = id
    if (slashIdx !== -1) {
      context = id.substring(0, slashIdx)
      shortId = id.substring(slashIdx + 1)
    }
    if (!groups.has(context)) groups.set(context, [])
    groups.get(context)!.push({ id, shortId, state: state as string })
  }
  const result: Array<{ context: string; nodes: Array<{ id: string; shortId: string; state: string }> }> = []
  const parentNodes = groups.get('__parent__')
  if (parentNodes) result.push({ context: '__parent__', nodes: parentNodes })
  for (const [ctx, nodes] of groups) {
    if (ctx !== '__parent__') result.push({ context: ctx, nodes })
  }
  return result
})

const isChildWfEvent = (bus: string) => {
  return bus.startsWith('AnswerBus:') || bus.startsWith('RequestBus:')
}

const parsedSummary = computed(() => {
  if (!workflowDefText.value.trim()) return ''
  try {
    const json = JSON.parse(workflowDefText.value) as EwoJson
    if (!json.wfDef) return ''
    const nodeCount = json.wfDef.nodes?.length ?? 0
    const routeCount = json.wiring?.routes?.length ?? 0
    const inputKeys = json.inputs ? Object.keys(json.inputs).join(', ') : 'none'
    return `${json.name || json.id} | ${nodeCount} nodes | ${routeCount} routes | inputs: ${inputKeys}`
  } catch {
    return ''
  }
})

// --- Console log capture ---
let originalConsoleLog: any = null
let _logBuffer: string[] | null = null

function formatLogArgs(args: any[]): string {
  const formatted = args.map(a => {
    if (typeof a === 'object') {
      try {
        const str = JSON.stringify(a, null, 2)
        return str.length > 2000 ? str.slice(0, 2000) + '\n...(truncated)' : str
      } catch { return String(a) }
    }
    return a
  })
  return formatted.join(' ')
}

function quickPreview(obj: any): string {
  if (obj === null || obj === undefined) return String(obj)
  if (Array.isArray(obj)) return `Array(${obj.length})`
  const keys = Object.keys(obj)
  const preview = keys.slice(0, 4).map(k => {
    const v = obj[k]
    if (typeof v === 'string') return `${k}: "${v.length > 40 ? v.slice(0, 40) + '...' : v}"`
    if (typeof v === 'number' || typeof v === 'boolean') return `${k}: ${v}`
    if (Array.isArray(v)) return `${k}: Array(${v.length})`
    if (v && typeof v === 'object') return `${k}: {...}`
    return `${k}: ${v}`
  }).join(', ')
  return `{${preview}${keys.length > 4 ? ', ...' : ''}}`
}

function formatLogArgsLightweight(args: any[]): string {
  return args.map(a => {
    if (typeof a === 'object') return quickPreview(a)
    return String(a)
  }).join(' ')
}

function installConsoleInterceptor(): void {
  console.log = (...args: any[]) => {
    if (_logBuffer) {
      _logBuffer.push(formatLogArgsLightweight(args))
    } else {
      logs.value.push(formatLogArgs(args))
    }
    originalConsoleLog(...args)
  }
}

onMounted(async () => {
  originalConsoleLog = console.log
  installConsoleInterceptor()

  rdbStore.rehydrate()

  try {
    const res = await $fetch('/api/workflow-defs/ewo-workflows') as any
    demoWorkflows.value = res.workflows || []

    const registry = new InMemoryWfRegistry()
    for (const dw of demoWorkflows.value) {
      try {
        const json = await $fetch('/api/workflow-defs/ewo-workflows', {
          params: { file: dw.path },
        }) as EwoJson
        registry.register(json)
      } catch { /* skip unloadable */ }
    }
    ewoEngine.setRegistry(registry)
    originalConsoleLog(`[Registry] Registered ${registry.listAll().length} workflow(s)`)
  } catch (err) {
    originalConsoleLog('Failed to load demo workflow list:', err)
  }
})

onBeforeUnmount(() => {
  if (originalConsoleLog) console.log = originalConsoleLog
})

// --- Validation ---

const validateInputJson = () => {
  inputJsonError.value = ''
  if (!inputJsonText.value.trim()) return
  try {
    JSON.parse(inputJsonText.value)
  } catch (e: any) {
    inputJsonError.value = `Invalid JSON: ${e.message}`
  }
}

const validateWorkflowDef = () => {
  workflowDefError.value = ''
  if (!workflowDefText.value.trim()) return
  try {
    const parsed = JSON.parse(workflowDefText.value)
    if (!parsed.id) {
      workflowDefError.value = 'Missing required field: id'
    } else if (!parsed.wfDef || !parsed.wfDef.nodes) {
      workflowDefError.value = 'Missing required field: wfDef.nodes'
    } else if (!parsed.wiring || !parsed.wiring.routes) {
      workflowDefError.value = 'Missing required field: wiring.routes'
    }
  } catch (e: any) {
    workflowDefError.value = `Invalid JSON: ${e.message}`
  }
}

// --- Load ---

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const json = JSON.parse(text)

    workflowDefText.value = JSON.stringify(json, null, 2)
    validateWorkflowDef()

    if (json.inputs) {
      const defaultInputs: Record<string, any> = {}
      for (const [key, def] of Object.entries(json.inputs as Record<string, { schema: string }>)) {
        defaultInputs[key] = sampleInputValue(key, def.schema)
      }
      inputJsonText.value = JSON.stringify(defaultInputs, null, 2)
      validateInputJson()
    } else if (!inputJsonText.value.trim()) {
      inputJsonText.value = '{}'
    }

    console.log(`Loaded EWO workflow: ${json.name || json.id}`)
    if (json.wfDef?.nodes) {
      console.log(`  Nodes: ${json.wfDef.nodes.map((n: any) => n.id).join(', ')}`)
    }
    if (json.wiring?.routes) {
      console.log(`  Routes: ${json.wiring.routes.map((r: any) => r.id).join(', ')}`)
    }
  } catch (e: any) {
    alert(`Failed to load file: ${e.message}`)
  }

  target.value = ''
}

const sampleValues: Record<string, Record<string, any>> = {
  userId: { string: 'user-001' },
  imageUrl: { string: 'https://example.com/photo.png' },
  orderId: { string: 'ORD-1234' },
  amount: { number: 3500 },
  price: { number: 1200 },
  query: { string: 'tokyo' },
  x: { number: 5 },
  n: { number: 3 },
  classId: { string: 'class-A' },
  nodeId: { string: 'root' },
}

function sampleInputValue(key: string, schema: string): any {
  const entry = sampleValues[key]
  if (entry && entry[schema] !== undefined) return entry[schema]
  if (schema === 'number') return 1
  if (schema === 'boolean') return false
  return 'sample'
}

const loadSelectedDemo = () => {
  const dw = demoWorkflows.value.find(d => d.path === selectedDemoPath.value)
  if (dw) loadDemoWorkflow(dw)
}

const loadDemoWorkflow = async (dw: { name: string; path: string }) => {
  try {
    const json = await $fetch('/api/workflow-defs/ewo-workflows', {
      params: { file: dw.path },
    }) as EwoJson

    workflowDefText.value = JSON.stringify(json, null, 2)
    validateWorkflowDef()

    if (json.inputs) {
      const defaultInputs: Record<string, any> = {}
      for (const [key, def] of Object.entries(json.inputs)) {
        defaultInputs[key] = sampleInputValue(key, def.schema)
      }
      inputJsonText.value = JSON.stringify(defaultInputs, null, 2)
    }

    console.log(`Loaded demo: ${json.name || json.id}`)
    console.log(`  Description: ${json.description || '(none)'}`)
    console.log(`  Nodes (${json.wfDef.nodes.length}): ${json.wfDef.nodes.map(n => `${n.id}[${n.operation}]`).join(' → ')}`)
    console.log(`  Wiring routes (${json.wiring.routes.length}): ${json.wiring.routes.map(r => r.id).join(', ')}`)
    const outputKeys = Object.keys(json.wfDef.outputs || {})
    console.log(`  WF outputs: ${outputKeys.join(', ') || '(none)'}`)
  } catch (e: any) {
    alert(`Failed to load demo workflow: ${e.message}`)
  }
}

const runWorkflow = async () => {
  loading.value = true
  logs.value = []
  ewoEngine.reset()

  _logBuffer = []

  try {
    console.log('=== EWO Workflow Execution ===')
    const inputJson = JSON.parse(inputJsonText.value)
    const ewoJson = JSON.parse(workflowDefText.value) as EwoJson

    console.log(`Workflow: ${ewoJson.name || ewoJson.id} v${ewoJson.version}`)
    console.log(`Input: ${JSON.stringify(inputJson)}`)
    console.log('')

    const result = await ewoEngine.run(ewoJson, inputJson)

    console.log('')
    console.log('=== Execution Result ===')
    console.log(`Status: ${result.status}`)
    if (result.outputs) {
      console.log(`Outputs: (${Object.keys(result.outputs).length} key(s)) — click "View Outputs" for full data`)
      lastOutputs.value = { status: result.status, data: result.outputs }
    }
    if (result.error) {
      console.log(`Error: ${result.error}`)
    }
  } catch (e: any) {
    _logBuffer.push(`ERROR: ${e.message}`)
    originalConsoleLog(`ERROR: ${e.message}`)
  } finally {
    const buffered = _logBuffer
    _logBuffer = null
    logs.value = buffered
    loading.value = false
  }
}

// --- Output modal ---

const copyOutputs = async () => {
  if (!lastOutputs.value) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(lastOutputs.value.data, null, 2))
    copyLabel.value = 'Copied!'
    setTimeout(() => { copyLabel.value = 'Copy to Clipboard' }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = JSON.stringify(lastOutputs.value.data, null, 2)
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copyLabel.value = 'Copied!'
    setTimeout(() => { copyLabel.value = 'Copy to Clipboard' }, 2000)
  }
}

// --- Clear ---

const clearAll = () => {
  inputJsonText.value = ''
  workflowDefText.value = ''
  inputJsonError.value = ''
  workflowDefError.value = ''
  logs.value = []
  lastOutputs.value = null
  ewoEngine.reset()
}

const clearLogs = () => {
  logs.value = []
}
</script>
