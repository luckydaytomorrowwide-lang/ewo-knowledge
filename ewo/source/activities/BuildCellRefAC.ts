/**
 * BuildCellRefAC Activity
 *
 * tableId, lineId, keyをインプットパラメータとして、cellrefを出力する
 *
 * Input:
 *   - tableId: テーブルID
 *   - lineId: 行ID
 *   - key: キー
 *
 * Output:
 *   - cellRef: CellRef文字列（例: "table:node_xxx|lineId:123|key:value"）
 */

import type { ActivityFunction } from '~/types/activity'

export interface BuildCellRefACPayload {
  tableId: string
  lineId: string
  key: string
}

export interface BuildCellRefACResult {
  cellRef: string
}

export const BuildCellRefAC: ActivityFunction = async (
  payload: BuildCellRefACPayload
): Promise<BuildCellRefACResult> => {
  const startTime = performance.now()
  console.log('[BuildCellRefAC] 実行開始:', payload)

  const { tableId, lineId, key } = payload
  const cellRef = `table:${tableId}|lineId:${lineId}|key:${key}`

  const result: BuildCellRefACResult = { cellRef }

  const endTime = performance.now()
  console.log(`[BuildCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const BuildCellRefACDef = {
  name: 'BuildCellRefAC',
  scope: 'common',
  description: 'tableId, lineId, keyからCellRef文字列を構築する'
}
