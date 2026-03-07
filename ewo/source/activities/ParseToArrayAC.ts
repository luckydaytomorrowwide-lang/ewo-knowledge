/**
 * ParseToArrayAC Activity
 * 
 * 文字列を配列にパースする
 * 
 * Input:
 *   - text: 文字列（例: "[a, b, c]" or "a, b, c"）
 * 
 * Output:
 *   配列: ["a", "b", "c"]
 */

import type { ActivityFunction } from '~/types/activity'

export interface ParseToArrayACPayload {
  text: string | string[]
}

export const ParseToArrayAC: ActivityFunction = async (payload: ParseToArrayACPayload) => {
  const startTime = performance.now()
  console.log('[ParseToArrayAC] 実行開始:', payload)

  const { text } = payload
  
  // すでに配列の場合はそのまま返す
  if (Array.isArray(text)) {
    const endTime = performance.now()
    console.log(`[ParseToArrayAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, text)
    return text}
  
  // [] を除去
  const clean = text?.trim().replace(/^\[|\]$/g, '')
  
  // 空なら空配列
  if (clean === undefined || clean.trim() === '') {
    console.log('[ParseToArrayAC] Empty array')
    const endTime = performance.now()
    console.log(`[ParseToArrayAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, [])
    return []
  }
  
  // カンマで分割してトリム、空文字を除去
  const result = clean
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '')
  
  console.log('[ParseToArrayAC] 完了:', result)
  const endTime = performance.now()
  console.log(`[ParseToArrayAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const ParseToArrayACDef = {
  name: 'ParseToArrayAC',
  scope: 'common',
  description: '文字列を配列にパースする'
}

