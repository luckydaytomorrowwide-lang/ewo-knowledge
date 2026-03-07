<template>
  <div class="bg-white min-h-screen">
    <!-- 上部：入力エリア + コントロール -->
    <div class="bg-gray-800 shadow">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-start gap-3">
          <!-- JSON テキストエリア -->
          <textarea
            v-model="jsonText"
            placeholder='Paste BuildLayoutBlockWF output JSON here...&#10;{ "rows": [ ... ] } or [ ... ]'
            class="flex-1 h-20 p-2 text-xs font-mono text-gray-200 bg-gray-900 border border-gray-600 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            spellcheck="false"
          />

          <!-- ボタン列 -->
          <div class="flex flex-col gap-1.5 shrink-0">
            <button
              @click="renderLayout"
              :disabled="!jsonText.trim() || isLoading"
              class="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Rendering...' : 'Render' }}
            </button>
            <label class="flex items-center justify-center gap-1 px-4 py-1.5 bg-gray-700 border border-gray-600 rounded cursor-pointer hover:bg-gray-600 transition-colors text-xs text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              File
              <input type="file" accept=".json" class="hidden" @change="handleFileUpload" />
            </label>
            <button
              v-if="jsonText.trim()"
              @click="clearInput"
              class="px-4 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>

          <!-- 表示モード切替 -->
          <div class="flex flex-col gap-1.5 shrink-0 border-l border-gray-600 pl-3">
            <div class="flex items-center gap-2">
              <button
                @click="nodeType = nodeType === 'instance' ? 'template' : 'instance'"
                class="px-2 py-1 text-[11px] rounded transition-colors whitespace-nowrap"
                :class="nodeType === 'instance' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'"
              >
                {{ nodeType === 'instance' ? 'Instance' : 'Template' }}
              </button>
              <select v-model="displayMode" class="border border-gray-600 rounded px-1 py-1 text-[11px] bg-gray-700 text-gray-200">
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="select">Select</option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="showBorders" class="cursor-pointer" />
                <span class="text-[10px] text-gray-400">Debug</span>
              </label>
              <button
                v-if="layoutRows"
                @click="showLayoutModal = true"
                class="text-[10px] text-blue-400 hover:text-blue-300 underline"
              >
                Layout Data
              </button>
            </div>
          </div>
        </div>

        <div v-if="parseError" class="mt-2 text-xs text-red-400">{{ parseError }}</div>
        <div v-if="layoutRows && !parseError" class="mt-1 text-[10px] text-gray-500">
          {{ Array.isArray(layoutRows) ? layoutRows.length : Object.keys(layoutRows).length }} entries loaded
        </div>
      </div>
    </div>

    <!-- layoutRows モーダル -->
    <div
      v-if="showLayoutModal"
      class="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50"
      @click.self="showLayoutModal = false"
    >
      <div class="bg-gray-900 rounded-lg shadow-xl w-[80vw] max-w-4xl max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div class="flex items-center gap-4">
            <div class="flex gap-4">
              <button
                @click="modalTab = 'raw'"
                class="text-sm font-bold pb-1 transition-colors"
                :class="modalTab === 'raw' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'"
              >
                layoutRows (生データ)
              </button>
              <button
                @click="modalTab = 'merged'"
                class="text-sm font-bold pb-1 transition-colors"
                :class="modalTab === 'merged' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'"
              >
                Merged Layout (統合済み)
              </button>
              <button
                @click="modalTab = 'hierarchy'"
                class="text-sm font-bold pb-1 transition-colors"
                :class="modalTab === 'hierarchy' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'"
              >
                Hierarchy (階層)
              </button>
            </div>
            <button
              @click="copyModalData"
              class="ml-2 px-2 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {{ copyLabel }}
            </button>
          </div>
          <button
            @click="showLayoutModal = false"
            class="text-gray-400 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 bg-black">
          <div v-if="modalTab === 'raw'" class="h-full">
            <pre class="text-xs text-green-400 font-mono whitespace-pre overflow-auto h-full p-2">{{ JSON.stringify(layoutRows, null, 2) }}</pre>
          </div>
          <div v-else-if="modalTab === 'merged'" class="h-full">
            <pre class="text-xs text-blue-400 font-mono whitespace-pre overflow-auto h-full p-2">{{ JSON.stringify(output, null, 2) }}</pre>
          </div>
          <div v-else class="h-full overflow-auto p-2 bg-gray-900 text-gray-300 font-mono text-xs">
            <div v-for="node in hierarchyTree" :key="node.path">
              <HierarchyNode :node="node" :depth="0" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ローディングインジケーター -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-gray-800 rounded-lg px-6 py-4 flex items-center gap-3 shadow-xl">
        <svg class="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-white text-sm font-medium">Rendering layout...</span>
      </div>
    </div>

    <!-- レイアウト描画エリア -->
    <div v-if="output" class="text-gray-900">
      <LayoutRenderer :node="output" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BuildMergedLayoutAC } from '../workflowDefs/common/activities'
import { ref, provide, watch, computed, defineComponent, h } from 'vue'
import LayoutRenderer from '../components/blocks/LayoutRenderer.vue'
import { useEventBus, EVENT_BUS_KEY } from '../composables/useEventBus'

const HierarchyNode = defineComponent({
  name: 'HierarchyNode',
  props: {
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 }
  },
  setup(props) {
    return () => {
      const indent = '  '.repeat(props.depth)
      const hasChildren = props.node.children && props.node.children.length > 0
      const prefix = props.depth === 0 ? '' : '└─ '

      return h('div', { class: 'whitespace-pre' }, [
        h('div', { class: 'hover:bg-gray-800 py-0.5 flex items-baseline gap-2' }, [
          h('span', { class: 'text-gray-500' }, indent + prefix),
          h('span', { class: 'text-blue-300' }, props.node.name),
          props.node.label ? h('span', { class: 'text-green-500 text-[10px]' }, `[${props.node.label}]`) : null,
          props.node.type ? h('span', { class: 'text-gray-600 text-[10px]' }, `(${props.node.type})`) : null,
        ]),
        hasChildren ? props.node.children.map((child: any) =>
          h(HierarchyNode, { node: child, depth: props.depth + 1 })
        ) : null
      ])
    }
  }
})

const output = ref<any>(null)
const layoutRows = ref<any>(null)
const jsonText = ref('')
const parseError = ref('')
const isLoading = ref(false)

const nodeType = ref<'instance' | 'template'>('instance')
const displayMode = ref<'view' | 'edit' | 'select'>('view')
const showBorders = ref(false)
const showLayoutModal = ref(false)
const modalTab = ref<'raw' | 'merged' | 'hierarchy'>('raw')
const copyLabel = ref('Copy')

const eventBus = useEventBus()
provide(EVENT_BUS_KEY, eventBus)
provide('showDebugBorders', showBorders)

eventBus.handlers.onAction = async (actionKey: string, payload?: any) => {
  console.log('[LayoutViewer] Action received:', actionKey, payload)
  alert(`Action received: ${actionKey}\n${JSON.stringify(payload, null, 2)}`)
}

const parseInputJson = (raw: string): any => {
  const parsed = JSON.parse(raw)
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.rows)) {
    return parsed.rows
  }
  if (Array.isArray(parsed)) {
    return parsed
  }
  throw new Error('Expected { "rows": [...] } or a JSON array of layout entries')
}

const buildMerged = async () => {
  if (!layoutRows.value) return
  const result = await BuildMergedLayoutAC({
    layoutRows: layoutRows.value,
    nodeType: nodeType.value,
    displayMode: displayMode.value
  })
  output.value = result.mergedLayoutNode
}

const renderLayout = async () => {
  parseError.value = ''
  isLoading.value = true
  try {
    const rows = parseInputJson(jsonText.value)
    layoutRows.value = rows
    await buildMerged()
  } catch (e: any) {
    parseError.value = e.message
    output.value = null
    layoutRows.value = null
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    jsonText.value = reader.result as string
    input.value = ''
  }
  reader.readAsText(file)
}

const clearInput = () => {
  jsonText.value = ''
  parseError.value = ''
  layoutRows.value = null
  output.value = null
}

const hierarchyTree = computed(() => {
  if (!layoutRows.value) return []

  const rootNodes: any[] = []
  const nodeMap = new Map<string, any>()

  const flatData: Record<string, any> = {}
  if (Array.isArray(layoutRows.value)) {
    layoutRows.value.forEach((item: any) => {
      Object.assign(flatData, item)
    })
  } else {
    Object.assign(flatData, layoutRows.value)
  }

  const keys = Object.keys(flatData).sort()

  keys.forEach(fullPath => {
    const segments = fullPath.split('.')
    const currentSegment = segments[segments.length - 1]
    const parentPath = segments.slice(0, -1).join('.')

    const node = {
      path: fullPath,
      name: currentSegment,
      label: flatData[fullPath]?.property?.label || '',
      type: flatData[fullPath]?.instViewType || flatData[fullPath]?.tplViewType || '',
      children: [] as any[]
    }

    nodeMap.set(fullPath, node)

    if (parentPath && nodeMap.has(parentPath)) {
      nodeMap.get(parentPath).children.push(node)
    } else {
      rootNodes.push(node)
    }
  })

  return rootNodes
})

const copyModalData = async () => {
  const data = modalTab.value === 'raw' ? layoutRows.value : output.value
  if (!data) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    copyLabel.value = 'Copied!'
    setTimeout(() => { copyLabel.value = 'Copy' }, 2000)
  } catch {
    copyLabel.value = 'Failed'
    setTimeout(() => { copyLabel.value = 'Copy' }, 2000)
  }
}

watch([nodeType, displayMode], async () => {
  if (layoutRows.value) {
    isLoading.value = true
    try {
      await buildMerged()
    } finally {
      isLoading.value = false
    }
  }
})
</script>
