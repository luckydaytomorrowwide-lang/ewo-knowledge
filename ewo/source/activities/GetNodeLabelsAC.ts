/**
 * GetNodeLabelsAC Activity
 *
 * ノードIDからノードのラベルを取得する
 *
 * Input:
 *   - nodeId: string
 *
 * Output:
 *   - labels: string[]
 */

import type { ActivityFunction } from '~/types/activity'

export interface GetNodeLabelsACPayload {
  nodeId: string
}

export interface GetNodeLabelsACResult {
  labels: string[]
}

export const GetNodeLabelsAC: ActivityFunction = async (
  payload: GetNodeLabelsACPayload
): Promise<GetNodeLabelsACResult> => {
  const startTime = performance.now()
  console.log('[GetNodeLabelsAC] 実行開始:', payload)

  const output: GetNodeLabelsACResult = { labels: [] }

  const postData: Record<string, any> = {
    workflow: 'GetNodeLabelsAC',
    nodeId: payload.nodeId,
  }

  try {
    const response = await $fetch<{ result: { labels: string[] } }>('http://localhost:8000/api/v1/activity', {
      method: 'POST',
      body: postData,
    })

    output.labels = response.result.labels || []
  } catch (error) {
    console.error('[GetNodeLabelsAC] エラー発生:', error)
  }

  const endTime = performance.now()
  console.log(`[GetNodeLabelsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetNodeLabelsACDef = {
  name: 'GetNodeLabelsAC',
  scope: 'common',
  description: 'ノードIDからノードのラベルを取得する',
  apiEndpoint: '/api/v1/activity',
}
