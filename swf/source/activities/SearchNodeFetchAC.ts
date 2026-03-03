/**
 * SearchNodeFetchAC Activity
 * 
 * ノードを検索する
 * 
 * Input:
 *   - searchType: 検索タイプ（オプション）
 *   - tableType: テーブルタイプ（1: Struct, 2: Data, 3: Deploy）
 *   - orderBy: 並び順キー（オプション）
 *   - limitNumber: 取得上限数（オプション）
 *   - depth: 取得の深さ（オプション）
 *   - nodeUlid: ノードULID
 *   - nodeLabel: ノードラベル配列
 *   - edgeType: エッジタイプ
 * 
 * Output:
 *   - nodeIds: 検索結果のノードULID配列
 */

import type { ActivityFunction } from '~/types/activity'
import { useTableNodeStore } from '~/stores/tableNode'

export interface SearchNodeFetchACPayload {
  searchType?: string
  tableType?: number
  nodeUlid: string
  nodeLabel: string[]
  edgeType: string
  orderBy?: string
  limitNumber?: number
  depth?: number
}

export interface SearchNodeFetchACResult {
  nodeIds: string[]
}

export const SearchNodeFetchAC: ActivityFunction = async (
  payload: SearchNodeFetchACPayload
): Promise<SearchNodeFetchACResult> => {
  const startTime = performance.now()
  console.log('[SearchNodeFetchAC] 実行開始:', payload)

  const tableNode = useTableNodeStore()
  const output: SearchNodeFetchACResult = { nodeIds: [] }


  const postData: Record<string, any> = {
    workflow: 'SearchNodeAC',
    payload,
  }

  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })

  response.result.forEach((ulid: string) => {
    output.nodeIds.push(ulid)
    tableNode.rows[ulid] = {}
  })

  const endTime = performance.now()
  console.log(`[SearchNodeFetchAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchNodeFetchACDef = {
  name: 'SearchNodeFetchAC',
  scope: 'common',
  description: 'ノードを検索する',
  apiEndpoint: '/api/v1/activity'
}

