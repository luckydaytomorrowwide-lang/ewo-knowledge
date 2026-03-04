/**
 * SeparateStringAC Activity
 * 
 * 文字列をセパレータで分割して配列にする
 * 
 * Input:
 *   - str: 分割する文字列
 *   - separator: セパレータ
 * 
 * Output:
 *   - rows: 分割された文字列の配列
 */

import type { ActivityFunction } from '~/types/activity'

export interface SeparateStringACPayload {
  str: string
  separator: string
}

export interface SeparateStringACResult {
  rows: string[]
}

export const SeparateStringAC: ActivityFunction = async (
  payload: SeparateStringACPayload
): Promise<SeparateStringACResult> => {
  const startTime = performance.now()
  console.log('[SeparateStringAC] 実行開始:', payload)

  const str = payload.str || ''
  const separator = payload.separator || ''
  
  const rows = str ? str.split(separator) : []

  const output: SeparateStringACResult = { rows }
  
  const endTime = performance.now()
  console.log(`[SeparateStringAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SeparateStringACDef = {
  name: 'SeparateStringAC',
  scope: 'common',
  description: '文字列をセパレータで分割して配列にする',
  dependencies: [],
  apiEndpoint: '/api/v1/workflow/master'
}
