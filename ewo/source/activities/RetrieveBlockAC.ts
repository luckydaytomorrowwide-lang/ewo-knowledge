/**
 * RetrieveBlockAC Activity
 *
 * 特定のブロック（lineId配下）のテーブルデータを取得する
 * RetrieveTableAC を searchType=2 でラップしたもの
 *
 * Input:
 *   - tableId: テーブルID
 *   - lineId: ブロックの基点となる lineId
 *   - depth: 再帰の深さ
 *
 * Output:
 *   { rows: any[] }
 */

import type { ActivityFunction } from '~/types/activity'
import { RetrieveTableAC } from './RetrieveTableAC'
import type { RetrieveTableACPayload } from './RetrieveTableAC'

export interface RetrieveBlockACPayload {
  tableId: string
  lineId: string
  depth?: number
}

export interface RetrieveBlockACResult {
  rows: any[]
}

export const RetrieveBlockAC: ActivityFunction = async (
  payload: RetrieveBlockACPayload
): Promise<RetrieveBlockACResult> => {
  const startTime = performance.now()
  console.log('[RetrieveBlockAC] 実行開始:', payload)

  const { tableId, lineId, depth } = payload

  // RetrieveTableAC を searchType=2 (指定lineId配下) で呼び出す
  const retrieveTablePayload: RetrieveTableACPayload = {
    tableId,
    searchType: 2,
    lineId,
    depth
  }

  const result = await RetrieveTableAC(retrieveTablePayload)
  
  const endTime = performance.now()
  console.log(`[RetrieveBlockAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const RetrieveBlockACDef = {
  name: 'RetrieveBlockAC',
  scope: 'common',
  description: '特定のブロック（lineId配下）のテーブルデータを取得する',
  apiEndpoint: '/api/v1/activity'
}
