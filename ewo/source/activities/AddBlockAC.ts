/**
 * AddBlockAC Activity
 * 
 * ブロックデータを追加する
 * 
 * Input:
 *   - parentLineId: 親ラインID
 *   - tableId: テーブルID
 *   - rows:
 * 
 * Output:
 *   - structRows: 格納
 *   - dataRows: 地番
 */

import type { ActivityFunction } from '~/types/activity'
import { type StructRow } from '~/stores/tableStruct'
import { type DataRow } from '~/stores/tableData'

export interface AddBlockACPayload {
  rows: StructRow[]
}

export interface AddBlockACResult {
  structRows: StructRow[]
  dataRows: DataRow[]
}

export const AddBlockAC: ActivityFunction = async (
  payload: AddBlockACPayload
): Promise<AddBlockACResult> => {
  const startTime = performance.now()
  console.log('[AddBlockAC] 実行開始:', payload)

  const postData: Record<string, any> = {
    workflow: 'AddBlockAC',
    rows: payload.rows
  }
  
  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })
  
  const result:AddBlockACResult = response.result

  const endTime = performance.now()
  console.log(`[AddBlockAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const AddBlïockACDef = {
  name: 'AddBlockAC',
  scope: 'common',
  description: 'ブロックデータを追加する',
  apiEndpoint: '/api/v1/activity'
}

