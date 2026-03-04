/**
 * GetParamAC Activity
 *
 * 入力:
 *  - eventId, key
 * 動作:
 *  - Pinia ストア `paramDelivery` に保存された
 *    eventId に紐づく任意の {key: value} の value を取得する
 * 戻り値:
 *  - { param }（存在しない場合は undefined）
 */

import type { ActivityFunction } from '~/types/activity'
import { useParamDeliveryStore } from '~/stores/paramDelivery'

export interface GetParamACPayload {
  eventId: string
  key: string
}

export interface GetParamACResult {
  param: any
}

export const GetParamAC: ActivityFunction = async (
  payload: GetParamACPayload
): Promise<GetParamACResult> => {
  const startTime = performance.now()
  console.log('[GetParamAC] 実行開始:', payload)

  try {
    const { eventId, key } = payload
    if (!eventId || !key) return { param: undefined }

    const store = useParamDeliveryStore()
    const value = store.getKV(eventId, key)

    const endTime = performance.now()
    console.log(`[GetParamAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, { param: value })
    return { param: value }
  } catch (_e) {
    const endTime = performance.now()
    console.log(`[GetParamAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, { param: undefined })
    return { param: undefined }
  }
}

export const GetParamACDef = {
  name: 'GetParamAC',
  scope: 'common',
  description: 'paramDelivery に保存された eventId→{key: value} の値を取得する'
}
