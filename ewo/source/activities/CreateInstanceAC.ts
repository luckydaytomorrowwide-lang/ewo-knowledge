/**
 * CreateInstanceAC Activity
 * 
 * 新しいテーブルを作成する
 * 
 * Input:
 *   - nodeUlid: ノードULID
 *   - templateTable: テンプレートテーブル
 * 
 * Output:
 *   - tableId: 作成されたテーブルのID
 */

import type { ActivityFunction } from '~/types/activity'

export interface CreateInstanceACPayload {
    nodeId: string
}

export interface CreateInstanceACResult {
    nodeId: string
}

export const CreateInstanceAC: ActivityFunction = async (
  payload: CreateInstanceACPayload
): Promise<CreateInstanceACResult> => {
  const startTime = performance.now()
  console.log('[CreateInstanceAC] 実行開始:', payload)

  const postData: Record<string, any> = {
    workflow: 'CreateInstanceAC',
      nodeId: payload.nodeId
  }
  
  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })
  
  const result:CreateInstanceACResult = response.result

  const endTime = performance.now()
  console.log(`[CreateInstanceAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateInstanceACDef = {
  name: 'CreateInstanceAC',
  scope: 'common',
  description: 'テーブルULIDをもとに新しいインスタンスを作成する',
  apiEndpoint: '/api/v1/activity'
}

