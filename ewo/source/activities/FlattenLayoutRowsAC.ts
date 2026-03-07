/**
 * FlattenLayoutRowsAC Activity
 *
 * ネストされた配列をフラット化する（Array.flat() 相当）
 *
 * Input:
 *   - rows: ネストされた配列（例: [[row1, row2], [row3]]）
 *
 * Output:
 *   - layoutRows: フラット化された配列（例: [row1, row2, row3]）
 */

import type { ActivityFunction } from '~/types/activity'

export interface FlattenLayoutRowsACPayload {
  rows: any[]
}

export interface FlattenLayoutRowsACResult {
  layoutRows: any[]
}

export const FlattenLayoutRowsAC: ActivityFunction = async (
  payload: FlattenLayoutRowsACPayload
): Promise<FlattenLayoutRowsACResult> => {
  const startTime = performance.now()
  console.log('[FlattenLayoutRowsAC] 実行開始:', payload)

  const { rows } = payload
  const layoutRows = Array.isArray(rows) ? rows.flat() : []

  const output: FlattenLayoutRowsACResult = { layoutRows }

  const endTime = performance.now()
  console.log(`[FlattenLayoutRowsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const FlattenLayoutRowsACDef = {
  name: 'FlattenLayoutRowsAC',
  scope: 'common',
  description: 'ネストされた配列をフラット化する',
}
