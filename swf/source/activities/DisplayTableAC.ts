/**
 * DisplayTableAC Activity
 * 
 * テーブルを表示する
 * 
 * Input:
 *   - tableUlid: テーブルULID
 * 
 * Output:
 *   - result: 表示結果（現在は未実装のためスタブ）
 */

import type { ActivityFunction } from '~/types/activity'

export interface DisplayTableACPayload {
  tableUlid: string
}

export interface DisplayTableACResult {
  result: any
}

export const DisplayTableAC: ActivityFunction = async (
  payload: DisplayTableACPayload
): Promise<DisplayTableACResult> => {
  const startTime = performance.now()
  console.log('[DisplayTableAC] 実行開始:', payload)

  // TODO: 実装が必要
  console.warn('[DisplayTableAC] Not implemented yet')
  
  const output: DisplayTableACResult = {
    result: null
  }

  const endTime = performance.now()
  console.log(`[DisplayTableAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const DisplayTableACDef = {
  name: 'DisplayTableAC',
  scope: 'common',
  description: 'テーブルを表示する（未実装）',
  status: 'stub'
}

