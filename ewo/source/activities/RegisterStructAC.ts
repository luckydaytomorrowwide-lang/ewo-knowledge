/**
 * RegisterStructAC Activity
 *
 * Struct行配列をPiniaのtableStructストアに登録する
 */

import type { ActivityFunction } from '~/types/activity'
import { useTableStructStore, type StructRow } from '~/stores/tableStruct'

export interface RegisterStructACPayload {
  rows: StructRow[]
}

export const RegisterStructAC: ActivityFunction = async (
  payload: RegisterStructACPayload
): Promise<boolean> => {
  const startTime = performance.now()
  console.log('[RegisterStructAC] 実行開始:', payload)

  const tableStruct = useTableStructStore()
  for (const [tableName, records] of Object.entries(payload.rows)) {
      // const lineId = tableName.match(/^node_struct_(.*)$/)?.[1]
      tableStruct.insert(tableName, records)
  }

  const endTime = performance.now()
  console.log(`[RegisterStructAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, true)
  return true
}

export const RegisterStructACDef = {
  name: 'RegisterStructAC',
  scope: 'common',
  description: 'Struct行配列をPiniaのtableStructストアに登録する'
}
