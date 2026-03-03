/**
 * CreateEdgeAC Activity
 * 
 * 新しいエッジ（関係）を作成する
 * 
 * Input:
 *   - sourceUlid: ソースノードULID
 *   - targetUlid: ターゲットノードULID
 *   - edgeType: エッジタイプ
 * 
 * Output:
 *   - result: 作成結果
 */

import type { ActivityFunction } from '~/types/activity'

export interface CreateEdgeACPayload {
  sourceNodeId: string
  targetNodeId: string
  edgeType: string
}

export interface CreateEdgeACResult {
  result: any
}

export const CreateEdgeAC: ActivityFunction = async (
  payload: CreateEdgeACPayload
): Promise<CreateEdgeACResult> => {
  const startTime = performance.now()
  console.log('[CreateEdgeAC] 実行開始:', payload)

  const postData: Record<string, any> = {
    workflow: 'CreateEdgeAC',
    sourceNodeId: payload.sourceNodeId,
    targetNodeId: payload.targetNodeId,
    edgeType: payload.edgeType
  }
  
  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })
  
  const result = { result: response.result }

  const endTime = performance.now()
  console.log(`[CreateEdgeAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateEdgeACDef = {
  name: 'CreateEdgeAC',
  scope: 'common',
  description: '新しいエッジ（関係）を作成する',
  apiEndpoint: '/api/v1/activity'
}

