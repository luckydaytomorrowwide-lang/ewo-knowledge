/**
 * PushRecordsAC Activity
 *
 * 行配列をPiniaのrdbストアに登録する
 */

import type { ActivityFunction } from '~/types/activity'
import { useRdbStore } from '~/stores/rdb'

export interface PushRecordsACPayload {
  tableId: string
  beforeRows: any[]
  afterRows: any[]
}

export const PushRecordsAC: ActivityFunction = async (
  payload: PushRecordsACPayload
): Promise<boolean> => {
  const startTime = performance.now()
  console.log('[PushRecordsAC] 実行開始:', payload)

  const rdb = useRdbStore()
  rdb.insert(payload.tableId, payload.afterRows)

  const endTime = performance.now()
  console.log(`[PushRecordsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, true)
  return true
}

export const PushRecordsACDef = {
  name: 'PushRecordsAC',
  scope: 'common',
  description: '行配列をPiniaのrdbストアに登録する'
}
