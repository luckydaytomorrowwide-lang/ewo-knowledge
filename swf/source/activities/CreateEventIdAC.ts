/**
 * CreateEventIdAC Activity
 * 
 * 新しいイベントIDを作成する（ULID）
 * 
 * Input:
 *   なし（または任意のpayload）
 * 
 * Output:
 *   - create_id: 生成されたイベントID（ULID）
 */

import type { ActivityFunction } from '~/types/activity'

export interface CreateEventIdACResult {
  create_id: string
}

export const CreateEventIdAC: ActivityFunction = async (
  payload?: any
): Promise<CreateEventIdACResult> => {
  const startTime = performance.now()
  console.log('[CreateEventIdAC] 実行開始:', payload)

  
  const eventId = useNuxtApp().$ulid()
  
  const result = { create_id: eventId }

  const endTime = performance.now()
  console.log(`[CreateEventIdAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateEventIdACDef = {
  name: 'CreateEventIdAC',
  scope: 'common',
  description: '新しいイベントIDを作成する'
}

