/**
 * CoalesceAC Activity
 *
 * null合体演算子（??）相当の処理
 * primary が null/undefined の場合に fallback を返す
 *
 * Input:
 *   - primary: 優先する値
 *   - fallback: フォールバック値
 *
 * Output:
 *   - value: primary ?? fallback の結果
 */

import type { ActivityFunction } from '~/types/activity'

export interface CoalesceACPayload {
  primary?: any
  fallback?: any
}

export interface CoalesceACResult {
  value: any
}

export const CoalesceAC: ActivityFunction = async (
  payload: CoalesceACPayload
): Promise<CoalesceACResult> => {
  const startTime = performance.now()
  console.log('[CoalesceAC] 実行開始:', payload)

  const value = payload.primary ?? payload.fallback

  const output: CoalesceACResult = { value }

  const endTime = performance.now()
  console.log(`[CoalesceAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const CoalesceACDef = {
  name: 'CoalesceAC',
  scope: 'common',
  description: 'null合体演算子（??）相当の処理',
}
