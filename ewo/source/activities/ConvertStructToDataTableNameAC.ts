/**
 * ConvertStructToDataTableNameAC Activity
 * 
 * テーブル名の '_struct' または '_structs' を '_data' に変換する
 * 
 * Input:
 *   - tableId: 変換前のテーブルID
 * 
 * Output:
 *   - tableId: 変換後のテーブルID
 */

import type { ActivityFunction } from '~/types/activity'

export interface ConvertStructToDataTableNameACPayload {
  tableId: string
}

export interface ConvertStructToDataTableNameACResult {
  tableId: string
}

export const ConvertStructToDataTableNameAC: ActivityFunction = async (
  payload: ConvertStructToDataTableNameACPayload
): Promise<ConvertStructToDataTableNameACResult> => {
  const startTime = performance.now()
  console.log('[ConvertStructToDataTableNameAC] 実行開始:', payload)

  const tableId = payload.tableId
  const tableDataId = tableId.replace(/_structs?/g, '_data')

  const output: ConvertStructToDataTableNameACResult = {
    tableId: tableDataId
  }

  console.log('[ConvertStructToDataTableNameAC] 完了:', output)
  const endTime = performance.now()
  console.log(`[ConvertStructToDataTableNameAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ConvertStructToDataTableNameACDef = {
  name: 'ConvertStructToDataTableNameAC',
  scope: 'common',
  description: 'テーブル名の struct を data に変換する',
}
