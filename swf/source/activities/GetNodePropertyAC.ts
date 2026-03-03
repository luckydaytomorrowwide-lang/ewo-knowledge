/**
 * GetNodePropertyAC Activity
 * 
 * ノードのプロパティを取得する
 * 
 * Input:
 *   - nodeId: ノードULID
 *   - property: プロパティ名
 * 
 * Output:
 *   - value: mixed
 */

import type { ActivityFunction } from '~/types/activity'
import { type NodeRow, useTableNodeStore } from '~/stores/tableNode'

export interface GetNodePropertyACPayload {
    nodeId: string
    property?: string
}

export interface GetNodePropertyACResult {
  value: any
}

export const GetNodePropertyAC: ActivityFunction = async (
  payload: GetNodePropertyACPayload
): Promise<GetNodePropertyACResult> => {
  const startTime = performance.now()
  console.log('[GetNodePropertyAC] 実行開始:', payload)

  const tableNode = useTableNodeStore()
  const output: GetNodePropertyACResult = { value: null }

  const postData: Record<string, any> = {
    workflow: 'GetNodePropertyAC',
    nodeId: payload.nodeId,
    property: payload.property,
  }

  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData,
  })

  output.value = response.result.value

  const endTime = performance.now()
  console.log(`[GetNodePropertyAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetNodePropertyACDef = {
  name: 'GetNodePropertyAC',
  scope: 'common',
  description: 'ノードのプロパティを取得する',
  apiEndpoint: '/api/v1/activity',
}

