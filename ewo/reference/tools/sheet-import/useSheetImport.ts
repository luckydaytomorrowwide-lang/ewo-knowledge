/**
 * composables/useSheetImport.ts
 *
 * xlsx アップロード → シート選択 → JSON変換プレビュー → rdb store 保存
 * の全ステップ状態管理を集約する composable
 */

import type { StructLine } from '~/utils/xlsx-to-deploy-json'
import { useRdbStore } from '~/stores/rdb'

export type ImportStep = 'upload' | 'selectSheet' | 'preview' | 'save' | 'done'

export function useSheetImport() {
  const rdbStore = useRdbStore()

  const step = ref<ImportStep>('upload')
  const file = ref<File | null>(null)
  const sheetNames = ref<string[]>([])
  const selectedSheet = ref<string>('')
  const deployJson = ref<StructLine[]>([])
  const tableName = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const meta = ref<Record<string, any>>({})

  function onFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    file.value = target.files?.[0] ?? null
    // ファイル変更時にリセット
    sheetNames.value = []
    selectedSheet.value = ''
    deployJson.value = []
    error.value = null
    step.value = 'upload'
  }

  /** Step 1: xlsx をPOSTしてシート名一覧を取得 */
  async function fetchSheetNames() {
    if (!file.value) {
      error.value = 'ファイルが選択されていません'
      return
    }

    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file.value)

      const result = await $fetch<{ sheetNames: string[] }>('/api/sheet-import/sheets', {
        method: 'POST',
        body: formData,
      })

      sheetNames.value = result.sheetNames
      step.value = 'selectSheet'

      if (result.sheetNames.length === 1) {
        selectedSheet.value = result.sheetNames[0]
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'シート名取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  /** Step 2/3: シートを選択してJSON変換、プレビュー表示 */
  async function convertSheet() {
    if (!file.value || !selectedSheet.value) {
      error.value = 'ファイルとシート名を選択してください'
      return
    }

    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file.value)
      formData.append('sheetName', selectedSheet.value)

      const result = await $fetch<{
        success: boolean
        sheetName: string
        rowCount: number
        deployJson: StructLine[]
        meta: Record<string, any>
      }>('/api/sheet-import/convert', {
        method: 'POST',
        body: formData,
      })

      deployJson.value = result.deployJson
      meta.value = result.meta

      const firstLineId = result.deployJson[0]?._custom?.value?.line_id ?? ''
      if (firstLineId) {
        tableName.value = `node_deploy_${firstLineId}`
      }

      step.value = 'preview'
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'JSON変換に失敗しました'
    } finally {
      loading.value = false
    }
  }

  /** Step 4: テーブル名を指定して rdb store に保存 */
  function saveToStore() {
    if (!tableName.value.trim()) {
      error.value = 'テーブル名を入力してください'
      return
    }
    if (deployJson.value.length === 0) {
      error.value = '保存するデータがありません'
      return
    }

    error.value = null

    try {
      // _custom ラッパーを除去してフラットな行オブジェクトとして保存
      // (SearchLineAC 等の alasql クエリがトップレベル line_id を前提とするため)
      const flatRows = deployJson.value.map(row => row._custom?.value ?? row)
      rdbStore.insert(tableName.value.trim(), flatRows)
      step.value = 'done'
    } catch (err: any) {
      error.value = err.message || 'store への保存に失敗しました'
    }
  }

  /** 全体リセット */
  function reset() {
    step.value = 'upload'
    file.value = null
    sheetNames.value = []
    selectedSheet.value = ''
    deployJson.value = []
    tableName.value = ''
    loading.value = false
    error.value = null
    meta.value = {}
  }

  return {
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
  }
}
