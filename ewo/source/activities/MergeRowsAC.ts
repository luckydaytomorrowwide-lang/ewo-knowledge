/**
 * MergeRowsAC Activity
 * 
 * 2つの行データ配列をマージする
 * 
 * Input:
 *   - srcRows: 追加元の行データ配列
 *   - destRows: 追加先の行データ配列
 * 
 * Output:
 *   - rows: マージされた行データ配列
 */

import type { ActivityFunction } from '~/types/activity'

export interface MergeRowsACPayload {
  srcRows: any[]
  destRows: any[]
}

export interface MergeRowsACResult {
  rows: any[]
}

export const MergeRowsAC: ActivityFunction = async (
  payload: MergeRowsACPayload
): Promise<MergeRowsACResult> => {
  const startTime = performance.now()
  console.log('[MergeRowsAC] 実行開始:', payload)

  const toArray = (val: any) => {
    if (Array.isArray(val)) return val
    if (val === null || val === undefined) return []
    const endTime = performance.now()
    console.log(`[MergeRowsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, [val])
    return [val]
}

  const srcRows = toArray(payload.srcRows)
  const destRows = toArray(payload.destRows)
  
  // srcRows の後ろに destRows を追加する
  const rows = [...srcRows, ...destRows]
  
  const output: MergeRowsACResult = { rows }

  const endTime = performance.now()
  console.log(`[MergeRowsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const MergeRowsACDef = {
  name: 'MergeRowsAC',
  scope: 'common',
  description: '2つの行データ配列をマージする',
  dependencies: [],
  apiEndpoint: '/api/v1/workflow/master'
}
