/**
 * BuildUpdateCellJsonAC Activity
 * 
 * セル更新用の JSON データを構築する
 * 
 * Input:
 *   - tableId: テーブルID
 *   - lineId: 行ID
 *   - key: キー
 *   - value: 値
 * 
 * Output:
 *   - json: 構築されたJSON文字列
 */

import type { ActivityFunction } from '~/types/activity'

export interface BuildUpdateCellJsonACPayload {
  tableId: string
  lineId: string
  key: string
  value: any
}

export interface BuildUpdateCellJsonACResult {
  json: string
}

export const BuildUpdateCellJsonAC: ActivityFunction = async (
  payload: BuildUpdateCellJsonACPayload
): Promise<BuildUpdateCellJsonACResult> => {
  const startTime = performance.now()
  console.log('[BuildUpdateCellJsonAC] 実行開始:', payload)

  const { tableId, lineId, key, value } = payload

  const result = {
    json: JSON.stringify({
      table: tableId,
      lineId: lineId,
      key: key,
      value: value
    })
  }

  const endTime = performance.now()
  console.log(`[BuildUpdateCellJsonAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const BuildUpdateCellJsonACDef = {
  name: 'BuildUpdateCellJsonAC',
  scope: 'common',
  description: 'セル更新用の JSON データを構築する'
}
