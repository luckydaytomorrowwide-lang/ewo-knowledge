/**
 * RegisterTemporaryAC Activity
 *
 * Temporary行配列をPiniaのtableTemporaryストアに登録する
 */

import type { ActivityFunction } from '~/types/activity'
import { useTableTemporaryStore, type TemporaryRow } from '~/stores/tableTemporary'

export interface RegisterTemporaryACPayload {
  tableId: string
  rows: TemporaryRow[]
}

export const RegisterTemporaryAC: ActivityFunction = async (
  payload: RegisterTemporaryACPayload
): Promise<boolean> => {
  const startTime = performance.now()
  console.log('[RegisterTemporaryAC] 実行開始:', payload)

  const tableTemporary = useTableTemporaryStore()
  // 他の箇所とキー整合性を保つため、tableUlidはそのまま使用する
  tableTemporary.insert(payload.tableId, payload.rows)

  const endTime = performance.now()
  console.log(`[RegisterTemporaryAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, true)
  return true
}

export const RegisterTemporaryACDef = {
  name: 'RegisterTemporaryAC',
  scope: 'common',
  description: 'Temporary行配列をPiniaのtableTemporaryストアに登録する'
}
