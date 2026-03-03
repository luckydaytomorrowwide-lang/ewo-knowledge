/**
 * SearchNodeAC Activity
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

export interface SearchNodeACPayload {
  searchType?: number
  tableType?: number
  orderBy?: string
  limitNumber?: number
  depth?: number
  nodeId: string
  nodeLabel: string[]
  edgeType: string
}

export interface SearchNodeACResult {
  nodeIds: string[]
}

export const SearchNodeAC: ActivityFunction = async (
  payload: SearchNodeACPayload
): Promise<SearchNodeACResult> => {
  const startTime = performance.now()
  console.log('[SearchNodeAC] 実行開始:', payload)

  const tableNode = useTableNodeStore()
  const output: SearchNodeACResult = { nodeIds: [] }

    const postData: Record<string, any> = {
        workflow: 'SearchNodeAC',
        ...payload,
    }

    const response = await $fetch('http://localhost:8000/api/v1/activity', {
        method: 'POST',
        body: postData
    })

    response.result.nodeIds.forEach((nodeId: string) => {
        output.nodeIds.push(nodeId)
    })

  const endTime = performance.now()
  console.log(`[SearchNodeAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchNodeACDef = {
  name: 'SearchNodeAC',
  scope: 'common',
  description: 'ノードを検索する',
  dependencies: ['DeployAC'],
  apiEndpoint: '/api/v1/workflow/master'
}

