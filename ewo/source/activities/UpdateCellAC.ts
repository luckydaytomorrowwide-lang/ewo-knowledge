/**
 * UpdateCellAC Activity
 * 
 * 指定された複数のセル更新情報（updates）に基づき、データを更新する
 * 
 * Input:
 *   - updates: 更新情報の配列（JSON文字列の配列、またはオブジェクトの配列）
 * 
 * Output:
 *   - updates: 実行された更新情報の配列
 */

import type { ActivityFunction } from '~/types/activity'
import {ofetch} from "ofetch";

export interface UpdateCellACPayload {
  updates: any[]
}

export interface UpdateCellACResult {
  updates: any[]
}

export const UpdateCellAC: ActivityFunction = async (
  payload: UpdateCellACPayload
): Promise<UpdateCellACResult> => {
  const startTime = performance.now()
  console.log('[UpdateCellAC] 実行開始:', payload)

  const postData: Record<string, any> = {
    workflow: 'UpdateCellAC',
    updates: payload.updates,
  }
  const response = await ofetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })
  console.log('[UpdateCellAC] APIレスポンス:', response)


  const result = {
    updates: response.result.updates
  }

  const endTime = performance.now()
  console.log(`[UpdateCellAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const UpdateCellACDef = {
  name: 'UpdateCellAC',
  scope: 'common',
  description: 'セルの値を更新する'
}
