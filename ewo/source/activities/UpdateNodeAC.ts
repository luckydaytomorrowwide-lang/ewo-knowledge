/**
 * UpdateNodeAC Activity
 * 
 * ノードを更新する
 * 
 * Input:
 *   - nodeId: ノードID
 *   - nodeLabel: ノードラベル（オプション）
 *   - property: 更新するプロパティ
 * 
 * Output:
 *   - element_id: 更新されたノードの elementId
 */

import type { ActivityFunction } from '~/types/activity'

export interface UpdateNodeACPayload {
  nodeId: string
  nodeLabel?: string[]
  property: any
}

export interface UpdateNodeACResult {
  element_id: string
}

export const UpdateNodeAC: ActivityFunction = async (
  payload: UpdateNodeACPayload
): Promise<UpdateNodeACResult> => {
  const startTime = performance.now()
  console.log('[UpdateNodeAC] 実行開始:', payload)

  const postData: Record<string, any> = {
    workflow: 'UpdateNodeAC',
    nodeUlid: payload.nodeId,
    nodeLabel: payload.nodeLabel,
    property: payload.property
  }
  
  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })
  
  // バックエンドは result に elementId 文字列を返す想定。
  // 互換のためオブジェクト形式で返る場合（{element_id|elementId}）も許容。
  const elementId: string =
    typeof (response as any)?.result === 'string'
      ? (response as any).result
      : (response as any)?.result?.element_id ?? (response as any)?.result?.elementId

  const output = { element_id: elementId }

  const endTime = performance.now()
  console.log(`[UpdateNodeAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const UpdateNodeACDef = {
  name: 'UpdateNodeAC',
  scope: 'common',
  description: 'ノードを更新する',
  apiEndpoint: '/api/v1/activity'
}

