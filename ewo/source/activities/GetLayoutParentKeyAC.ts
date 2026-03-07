/**
 * GetLayoutParentKeyAC Activity
 */

import type { ActivityFunction } from '~/types/activity'

export interface GetLayoutParentKeyACPayload {
  key: string
}

export interface GetLayoutParentKeyACResult {
  key: string
}

export const GetLayoutParentKeyAC: ActivityFunction = async (
  payload: GetLayoutParentKeyACPayload
): Promise<GetLayoutParentKeyACResult> => {
  const startTime = performance.now()
  console.log('[GetLayoutParentKeyAC] 実行開始:', payload)

  const key = payload.key || ''
  let resultKey = key

  // "." で分割して、最後の要素を除去する
  const partsByDot = key.split('.')
  if (partsByDot.length > 2) {
    resultKey = partsByDot.slice(0, -1).join('.')
  }

  const output: GetLayoutParentKeyACResult = {
    key: resultKey
  }

  const endTime = performance.now()
  console.log(`[GetLayoutParentKeyAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetLayoutParentKeyACDef = {
  name: 'GetLayoutParentKeyAC',
  scope: 'common',
  description: 'レイアウトの親キーを取得する'
}
