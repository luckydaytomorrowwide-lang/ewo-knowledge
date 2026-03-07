<!--
  components/SheetImporter.vue

  xlsx アップロード → シート選択 → JSON変換プレビュー → rdb store 保存
  段階的ウィザード UI
-->
<template>
  <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md text-gray-900">
    <h2 class="text-xl font-bold mb-4">Sheet Import</h2>

    <!-- ステップインジケーター -->
    <div class="flex items-center gap-2 mb-6 text-sm">
      <span
        v-for="(label, key) in stepLabels"
        :key="key"
        class="px-3 py-1 rounded-full transition-colors"
        :class="stepClass(key)"
      >
        {{ label }}
      </span>
    </div>

    <!-- エラー表示 -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Step 1: ファイルアップロード -->
    <div v-if="step === 'upload' || step === 'selectSheet'">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">xlsx ファイルを選択</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          @change="onFileChange"
        />
        <p v-if="file" class="mt-1 text-xs text-gray-500">
          {{ file.name }} ({{ formatFileSize(file.size) }})
        </p>
      </div>

      <button
        :disabled="!file || loading"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        @click="fetchSheetNames"
      >
        {{ loading ? '読み込み中...' : 'シート一覧を取得' }}
      </button>
    </div>

    <!-- Step 2: シート選択 -->
    <div v-if="step === 'selectSheet'" class="mt-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">シートを選択</label>
        <select
          v-model="selectedSheet"
          class="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="" disabled>-- シートを選択 --</option>
          <option v-for="name in sheetNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>

      <button
        :disabled="!selectedSheet || loading"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        @click="convertSheet"
      >
        {{ loading ? '変換中...' : 'JSON に変換' }}
      </button>
    </div>

    <!-- Step 3: JSON プレビュー -->
    <div v-if="step === 'preview' || step === 'save'" class="mt-6">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold">変換結果プレビュー</h3>
        <span class="text-xs text-gray-500">
          {{ deployJson.length }} 行
          <template v-if="meta.originalRowCount"> / 元データ {{ meta.originalRowCount }} 行</template>
        </span>
      </div>

      <pre
        class="max-h-96 overflow-auto bg-gray-50 border border-gray-200 rounded p-4 text-xs leading-relaxed"
      >{{ jsonPreview }}</pre>
    </div>

    <!-- Step 4: テーブル名指定 & 保存 -->
    <div v-if="step === 'preview' || step === 'save'" class="mt-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">テーブル名</label>
        <input
          v-model="tableName"
          type="text"
          placeholder="例: baseinfo_structs"
          class="block w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        :disabled="!tableName.trim() || deployJson.length === 0"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        @click="saveToStore"
      >
        rdb store に保存
      </button>
    </div>

    <!-- 完了 -->
    <div v-if="step === 'done'" class="mt-6 p-4 bg-green-50 border border-green-200 rounded">
      <p class="text-green-700 font-medium">
        テーブル「{{ tableName }}」に {{ deployJson.length }} 行を保存しました。
      </p>
      <button
        class="mt-3 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
        @click="reset"
      >
        別のファイルをインポート
      </button>
    </div>

    <!-- rdb Store Manager -->
    <div class="mt-10 pt-6 border-t border-gray-300">
      <h2 class="text-xl font-bold mb-4">rdb Store Manager</h2>

      <div v-if="rdbStore.tableStats.length === 0" class="text-sm text-gray-500">
        rdb store にテーブルがありません
      </div>

      <template v-else>
        <div class="flex items-center gap-3 mb-3">
          <button
            class="text-xs text-blue-600 hover:underline"
            @click="selectAllTables"
          >
            全選択
          </button>
          <button
            class="text-xs text-blue-600 hover:underline"
            @click="deselectAllTables"
          >
            選択解除
          </button>
        </div>

        <div class="space-y-1 mb-4">
          <label
            v-for="t in rdbStore.tableStats"
            :key="t.name"
            class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
          >
            <input
              v-model="selectedTables"
              type="checkbox"
              :value="t.name"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="font-mono">{{ t.name }}</span>
            <span class="text-xs text-gray-400">({{ t.rowCount }} 行)</span>
          </label>
        </div>

        <div class="flex items-center gap-3">
          <button
            :disabled="selectedTables.length === 0"
            class="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleDropSelected"
          >
            選択したテーブルを削除
          </button>
          <button
            class="px-3 py-1.5 bg-red-800 text-white rounded text-sm hover:bg-red-900"
            @click="handleClearAll"
          >
            全テーブルを削除
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSheetImport } from '~/composables/useSheetImport'
import type { ImportStep } from '~/composables/useSheetImport'
import { useRdbStore } from '~/stores/rdb'

const {
  step,
  file,
  sheetNames,
  selectedSheet,
  deployJson,
  tableName,
  loading,
  error,
  meta,
  onFileChange,
  fetchSheetNames,
  convertSheet,
  saveToStore,
  reset,
} = useSheetImport()

const rdbStore = useRdbStore()
const selectedTables = ref<string[]>([])

function selectAllTables() {
  selectedTables.value = rdbStore.tableNames.slice()
}

function deselectAllTables() {
  selectedTables.value = []
}

function handleDropSelected() {
  if (selectedTables.value.length === 0) return
  const names = selectedTables.value.join(', ')
  if (!confirm(`以下のテーブルを削除しますか？\n${names}`)) return
  rdbStore.dropTables(selectedTables.value)
  selectedTables.value = []
}

function handleClearAll() {
  if (!confirm('全テーブルを削除しますか？')) return
  rdbStore.clearAll()
  selectedTables.value = []
}

const stepLabels: Record<string, string> = {
  upload: '1. ファイル選択',
  selectSheet: '2. シート選択',
  preview: '3. プレビュー',
  save: '4. 保存',
}

const STEP_ORDER: ImportStep[] = ['upload', 'selectSheet', 'preview', 'save', 'done']

function stepClass(key: string) {
  const currentIdx = STEP_ORDER.indexOf(step.value)
  const keyIdx = STEP_ORDER.indexOf(key as ImportStep)

  if (key === step.value || (step.value === 'done' && key === 'save')) {
    return 'bg-blue-600 text-white'
  }
  if (keyIdx < currentIdx) {
    return 'bg-blue-100 text-blue-700'
  }
  return 'bg-gray-100 text-gray-400'
}

const jsonPreview = computed(() => {
  return JSON.stringify(deployJson.value, null, 2)
})

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
