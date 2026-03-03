/**
 * SetParamAC Activity
 *
 * 入力:
 *  - eventId, key, value を受け取り
 * 動作:
 *  - Pinia ストア `paramDelivery` に eventId をキーとして
 *    任意の { [key]: value } を保存（同じ key は上書き）
 * 戻り値:
 *  - 成功時 true、失敗時 false
 */

import type { ActivityFunction } from '~/types/activity'
import { useParamDeliveryStore } from '~/stores/paramDelivery'

export interface SetParamACPayload {
  eventId: string
  key: string
  value: any
}

export const SetParamAC: ActivityFunction = async (
  payload: SetParamACPayload
): Promise<boolean> => {
  const startTime = performance.now()
  console.log('[SetParamAC] 実行開始:', payload)

  try {
    const { eventId, key, value } = payload
    if (!eventId || !key) return false

    const store = useParamDeliveryStore()
    store.setKV(eventId, key, value)

    const endTime = performance.now()
    console.log(`[SetParamAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, true)
    return true
  } catch (e) {
    // 失敗した場合は false を返す
    const endTime = performance.now()
    console.log(`[SetParamAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, false)
    return false
  }
}

export const SetParamACDef = {
  name: 'SetParamAC',
  scope: 'common',
  description: 'paramDelivery に eventId をキーとして任意の {key: value} を保存する'
}
