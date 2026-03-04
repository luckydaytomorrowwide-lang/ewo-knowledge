/**
 * FirstRowAC Activity
 * 
 * 配列の最初の要素を取得する
 * 
 * Input:
 *   - rows: 配列
 * 
 * Output:
 *   配列の最初の要素（配列が空の場合はnull）
 */

import type { ActivityFunction } from '~/types/activity'

export interface FirstRowACPayload {
  rows: any[]
}

export const FirstRowAC: ActivityFunction = async (payload: FirstRowACPayload) => {
  const startTime = performance.now()
  console.log('[FirstRowAC] 実行開始:', payload)

  const { rows } = payload
  
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    console.log('[FirstRowAC] Empty array or invalid input')
    const endTime = performance.now()
    console.log(`[FirstRowAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, null)
    return undefined
  }
  
  const result = rows[0]

  const endTime = performance.now()
  console.log(`[FirstRowAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const FirstRowACDef = {
  name: 'FirstRowAC',
  scope: 'common',
  description: '配列の最初の要素を取得する'
}

