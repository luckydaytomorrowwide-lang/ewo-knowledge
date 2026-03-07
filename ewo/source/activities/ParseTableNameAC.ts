/**
 * ParseTableNameAC Activity
 * 
 * テーブル名（例: table_struct_01kcm9mw5nkq9hzf6pgj7hatq1）をパースして
 * mode, type, lineId を抽出する
 * 
 * Input:
 *   - tableName: パース対象のテーブル名
 * 
 * Output:
 *   - mode: 'table' など
 *   - type: 'struct' | 'data' など
 *   - lineId: ULID部分
 */

import type { ActivityFunction } from '~/types/activity'

export interface ParseTableNameACPayload {
  tableId: string
}

export interface ParseTableNameACResult {
  mode: string
  type: string
  ulid: string
}

export const ParseTableNameAC: ActivityFunction = async (
  payload: ParseTableNameACPayload
): Promise<ParseTableNameACResult> => {
  const startTime = performance.now()
  console.log('[ParseTableNameAC] 実行開始:', payload)

  const { tableId } = payload
  
  // table_struct_01kcm9mw5nkq9hzf6pgj7hatq1
  // を _ で分割
  const parts = tableId.split('_')
  
  const output: ParseTableNameACResult = {
    mode: parts[0] || '',
    type: parts[1] || '',
    ulid: parts[2] || ''
  }

  console.log('[ParseTableNameAC] 完了:', output)

  const endTime = performance.now()
  console.log(`[ParseTableNameAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ParseTableNameACDef = {
  name: 'ParseTableNameAC',
  scope: 'common',
  description: 'テーブル名をパースして mode, type, lineId を抽出する',
  dependencies: []
}
