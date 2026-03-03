/**
 * RegisterDataAC Activity
 *
 * Data行配列をPiniaのtableDataストアに登録する
 */

import type { ActivityFunction } from '~/types/activity'
import { useTableDataStore, type DataRow } from '~/stores/tableData'

export interface RegisterDataACPayload {
    rows: any
}

export const RegisterDataAC: ActivityFunction = async (
  payload: RegisterDataACPayload
): Promise<boolean> => {
  const startTime = performance.now()
  console.log('[RegisterDataAC] 実行開始:', payload)

  const tableData = useTableDataStore()
  for (const [tableName, records] of Object.entries(payload.rows)) {
      // const lineId = tableName.match(/^node_(.*?)_data$/)?.[1]
      tableData.insert(tableName, records)
  }

  const endTime = performance.now()
  console.log(`[RegisterDataAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, true)
  return true
}

export const RegisterDataACDef = {
  name: 'RegisterDataAC',
  scope: 'common',
  description: 'Data行配列をPiniaのtableDataストアに登録する'
}
