/**
 * BuildTemporaryTableIdAC Activity
 * 
 * 指定された tableId と ulid から一時テーブル ID を生成する
 *
 * Input:
 *   - tableId: ベースとなるテーブルID
 *   - ulid: 一時テーブル用のULID
 * 
 * Output:
 *   - tempTableId: 生成された一時テーブルID
 */

import type { ActivityFunction } from '~/types/activity'

export interface BuildTemporaryTableIdACPayload {
  tableId: string
  ulid: string
}

export interface BuildTemporaryTableIdACResult {
  tempTableId: string
}

export const BuildTemporaryTableIdAC: ActivityFunction = async (
  payload: BuildTemporaryTableIdACPayload
): Promise<BuildTemporaryTableIdACResult> => {
  const startTime = performance.now()
  console.log('[BuildTemporaryTableIdAC] 実行開始:', payload)

  const { tableId, ulid } = payload

  // Laravel側: preg_replace('/^([^_]+)_?(.*?)$/', '$1_temporary_' . $ulid, $tableId)
  // 例: table_struct_xxx -> table_temporary_ulid
  // 例: node_xxx -> node_temporary_ulid

  // const tempTableId = tableId.replace(/^([^_]+)_?(.*?)$/, `$1_temporary_${ulid}`)
  const tempTableId = tableId + '_' + ulid

  const output: BuildTemporaryTableIdACResult = {
    tempTableId: tempTableId.toLowerCase()
  }

  console.log('[BuildTemporaryTableIdAC] 完了:', output)

  const endTime = performance.now()
  console.log(`[BuildTemporaryTableIdAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildTemporaryTableIdACDef = {
  name: 'BuildTemporaryTableIdAC',
  scope: 'common',
  description: '一時テーブル ID を生成する'
}
