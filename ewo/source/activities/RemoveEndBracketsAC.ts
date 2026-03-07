/**
 * RemoveEndBracketsAC Activity
 *
 * 文字列の末尾セグメント（最後の "." 以降）を除去する
 * 例: "root.block.0" → "root.block"
 *
 * Input:
 *   - key: 対象文字列
 *
 * Output:
 *   - key: 末尾セグメントを除去した文字列
 */

import type { ActivityFunction } from '~/types/activity'

export interface RemoveEndBracketsACPayload {
  key: string
}

export interface RemoveEndBracketsACResult {
  key: string
}

export const RemoveEndBracketsAC: ActivityFunction = async (
  payload: RemoveEndBracketsACPayload
): Promise<RemoveEndBracketsACResult> => {
  const startTime = performance.now()
  console.log('[RemoveEndBracketsAC] 実行開始:', payload)

  const key = payload.key || ''
  const resultKey = key.replace(/\.[^.]+?$/, '')

  const output: RemoveEndBracketsACResult = { key: resultKey }

  const endTime = performance.now()
  console.log(`[RemoveEndBracketsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const RemoveEndBracketsACDef = {
  name: 'RemoveEndBracketsAC',
  scope: 'common',
  description: '文字列の末尾セグメントを除去する',
}
