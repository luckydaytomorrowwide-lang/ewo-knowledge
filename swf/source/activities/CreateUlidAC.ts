/**
 * CreateUlidAC Activity
 * 
 * ULID を生成する
 * 
 * Input:
 *   - なし
 * 
 * Output:
 *   - ulid: 生成された ULID
 */

import type { ActivityFunction } from '~/types/activity'
import { monotonicFactory } from 'ulid'

const m = monotonicFactory()

export interface CreateUlidACPayload {
  [key: string]: any
}

export interface CreateUlidACResult {
  ulid: string
}

export const CreateUlidAC: ActivityFunction = async (
  payload: CreateUlidACPayload = {}
): Promise<CreateUlidACResult> => {
  const startTime = performance.now()
  console.log('[CreateUlidAC] 実行開始:', payload)

  console.log('[CreateUlidAC] 実行開始')

  const ulid = m()

  const output: CreateUlidACResult = {
    ulid: ulid
  }


  const endTime = performance.now()
  console.log(`[CreateUlidAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const CreateUlidACDef = {
  name: 'CreateUlidAC',
  scope: 'common',
  description: 'ULID を生成する',
}
