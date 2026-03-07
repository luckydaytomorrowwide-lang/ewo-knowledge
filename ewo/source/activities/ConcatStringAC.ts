/**
 * ConcatStringAC Activity
 * 
 * 2つの文字列をセパレータで結合する
 * 
 * Input:
 *   - srcStr: 結合する文字列1
 *   - destStr: 結合する文字列2
 *   - separator: セパレータ
 * 
 * Output:
 *   - str: 結合された文字列
 */

import type { ActivityFunction } from '~/types/activity'

export interface ConcatStringACPayload {
  srcStr: string
  destStr: string
  separator: string
}

export interface ConcatStringACResult {
  str: string
}

export const ConcatStringAC: ActivityFunction = async (
  payload: ConcatStringACPayload
): Promise<ConcatStringACResult> => {
  const startTime = performance.now()
  console.log('[ConcatStringAC] 実行開始:', payload)

  const srcStr = payload.srcStr || ''
  const destStr = payload.destStr || ''
  const separator = payload.separator || ''
  
  let str = srcStr

  if (srcStr && destStr) str += separator

  str += destStr

  const output: ConcatStringACResult = { str }
  
  console.log('[ConcatStringAC] 完了:', str)
  const endTime = performance.now()
  console.log(`[ConcatStringAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ConcatStringACDef = {
  name: 'ConcatStringAC',
  scope: 'common',
  description: '2つの文字列をセパレータで結合する',
  dependencies: [],
  apiEndpoint: '/api/v1/workflow/master'
}
