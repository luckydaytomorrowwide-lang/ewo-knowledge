/**
 * SearchTableFetchAC Activity
 * 
 * テーブルを検索する（APIから取得してPiniaへ反映）
 * 
 * Input:
 *   - searchType: 検索タイプ（オプション）
 *   - tableType: テーブルタイプ（オプション）
 *   - tableUlid: テーブルULID（オプション）
 *   - nodeUlid: ノードULID
 * 
 * Output:
 *   - search_table_ulids: 検索結果のテーブルULID配列
 */

import type { ActivityFunction } from '~/types/activity'
import { type NodeRow, useTableNodeStore } from '~/stores/tableNode'

export interface SearchTableFetchACPayload {
    nodeId: string
    searchType?: string
}

export interface SearchTableFetchACResult {
    tableNames: string[]
}

export const SearchTableFetchAC: ActivityFunction = async (
  payload: SearchTableFetchACPayload
): Promise<SearchTableFetchACResult> => {
  const startTime = performance.now()
  console.log('[SearchTableFetchAC] 実行開始:', payload)

  const tableNode = useTableNodeStore()
  const output: SearchTableFetchACResult = { tableNames: [] }

  const postData: Record<string, any> = {
    workflow: 'SearchTableAC',
    nodeId: payload.nodeId,
  }

  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData,
  })

  tableNode.rows[payload.nodeId] = {
      data: response.result
  } as NodeRow
  output.tableNames = response.result.tableNames

  const endTime = performance.now()
  console.log(`[SearchTableFetchAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchTableFetchACDef = {
  name: 'SearchTableFetchAC',
  scope: 'common',
  description: 'テーブルを検索する',
  apiEndpoint: '/api/v1/activity',
}

