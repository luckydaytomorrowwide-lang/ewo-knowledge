/**
 * CreateNodeAC Activity
 * 
 * 新しいノードを作成する
 * 
 * Input:
 *   - label: ノードラベル配列
 *   - property: プロパティ（オプション）
 * 
 * Output:
 *   - create_node_id: 作成されたノードのID
 */

import type { ActivityFunction } from '~/types/activity'

export interface CreateNodeACPayload {
  label: string[]
  property?: any
}

export interface CreateNodeACResult {
  nodeId: string
}

export const CreateNodeAC: ActivityFunction = async (
  payload: CreateNodeACPayload
): Promise<CreateNodeACResult> => {
  const startTime = performance.now()
  console.log('[CreateNodeAC] 実行開始:', payload)

  const postData: Record<string, any> = {
    workflow: 'CreateNodeAC',
    label: payload.label,
    property: payload.property
  }
  
  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })
  
  const result = { nodeId: response.result.properties.line_id }

  const endTime = performance.now()
  console.log(`[CreateNodeAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateNodeACDef = {
  name: 'CreateNodeAC',
  scope: 'common',
  description: '新しいノードを作成する',
  apiEndpoint: '/api/v1/activity'
}

