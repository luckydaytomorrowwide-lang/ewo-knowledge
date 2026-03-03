/**
 * PushRecordsAC Activity
 *
 * レコードを保存（Upsert）する
 *
 * Input:
 *   - tableId: テーブルID
 *   - rows: 保存するデータの配列
 *
 * Output:
 *   { affectedRowsCount: number }
 */

import { ofetch } from 'ofetch'
import type { ActivityFunction } from '~/types/activity'
import { useTableStructStore } from '~/stores/tableStruct'
import { useTableDataStore } from '~/stores/tableData'

export interface PushRecordsACPayload {
  tableId: string
  rows: any[]
}

export interface PushRecordsACResult {
  affectedRowsCount: number
}

export const PushRecordsAC_: ActivityFunction = async (
  payload: PushRecordsACPayload
): Promise<PushRecordsACResult> => {
  const startTime = performance.now()
  console.log('[PushRecordsAC_] 実行開始:', payload)

  const { tableId, rows: rawRows } = payload
  const tableStruct = useTableStructStore()
  const tableData = useTableDataStore()

  const isData = tableId.includes('_data')

  // 格納の場合idカラム除外 (Laravel側の if (!$isData) { unset($row['id']); } 相当)
  let rows = rawRows.map(row => {
    const newRow = { ...row }
    if (!isData) {
      delete newRow.id
    }
    // jsonb型カラム対応（空配列の場合nullに変換）
    for (const key in newRow) {
      if (Array.isArray(newRow[key]) && newRow[key].length === 0) {
        newRow[key] = null
      } else if (newRow[key] === undefined || newRow[key] === '') {
        // PHPのempty()相当の挙動を模倣（必要に応じて調整）
        newRow[key] = null
      }
    }
    const endTime = performance.now()

    console.log(`[PushRecordsAC_] 完了 (${(endTime - startTime).toFixed(3)}ms):`, newRow)
    return newRow
  })

  // Piniaストアに保存 (Upsert)
  if (isData) {
    tableData.insert(tableId, rows)
  } else {
    tableStruct.insert(tableId, rows)
  }

  // API呼び出し（サーバー側のDBにも反映させる）
  try {
    const postData: Record<string, any> = {
      workflow: 'PushRecordsAC',
      tableId: tableId,
      rows: rows,
    }
    await ofetch('http://localhost:8000/api/v1/activity', {
      method: 'POST',
      body: postData
    })
    console.log('[PushRecordsAC] API保存成功')
  } catch (error) {
    console.error('[PushRecordsAC] API保存失敗:', error)
    // フロント側ではストアに保存されているため、エラーをスローするか検討
    // ここではLaravel側の実装に倣い、影響行数を返却する
  }

  const output: PushRecordsACResult = {
    affectedRowsCount: rows.length
  }

  const endTime = performance.now()
  console.log(`[PushRecordsAC_] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const PushRecordsACDef = {
  name: 'PushRecordsAC',
  scope: 'common',
  description: 'レコードを保存（Upsert）する',
  apiEndpoint: '/api/v1/activity'
}
