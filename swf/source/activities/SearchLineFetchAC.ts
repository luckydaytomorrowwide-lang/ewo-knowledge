/**
 * SearchLineFetchAC Activity
 *
 * テーブル内の行を検索する（APIから取得してPiniaへ反映）
 *
 * Input:
 *   - searchType: 検索タイプ（'condition', 'type', etc.）
 *   - tableType: テーブルタイプ（1: Struct, 2: Data, 3: Deploy）
 *   - tableUlid: テーブルULID
 *   - lineId: 行ULID（オプション）
 *   - parentId: 親ID（オプション）
 *   - nCat: n_cat（オプション）
 *   - uCat: u_cat（オプション）
 *   - key: キー（オプション）
 *   - table: テーブル名（オプション）
 *   - depId: 依存ID（オプション）
 *   - iType: 入力タイプ（オプション）
 *   - fType: フィールドタイプ（オプション）
 *   - value: 値（オプション）
 *
 * Output:
 *   - lineIds: 検索結果の行ULID配列
 */

import type { ActivityFunction } from '~/types/activity'
import { useTableStructStore } from '~/stores/tableStruct'

export interface SearchLineFetchACPayload {
  searchType?: string
  tableType?: number
  tableUlid: string
  lineId?: string
  parentId?: string
  nCat?: string
  uCat?: string
  table?: string
  mode?: string
  key?: string
  depId?: string
  iType?: string
  fType?: string
  value?: any
}

export interface SearchLineFetchACResult {
  lineIds: string[]
}

export const SearchLineFetchAC: ActivityFunction = async (
  payload: SearchLineFetchACPayload
): Promise<SearchLineFetchACResult> => {
  const startTime = performance.now()
  console.log('[SearchLineFetchAC] 実行開始:', payload)

  const tableStruct = useTableStructStore()
  const output: SearchLineFetchACResult = { lineIds: [] }

  const postData: Record<string, any> = {
    workflow: 'SearchLineAC',
    tableType: payload.tableType,
    tableUlid: payload.tableUlid,
    lineId: payload.lineId,
    parentId: payload.parentId,
    nCat: payload.nCat,
    uCat: payload.uCat,
    table: payload.table,
    key: payload.key,
    depId: payload.depId,
    iType: payload.iType,
    fType: payload.fType,
    value: payload.value
  }

  const response = await $fetch('http://localhost:8000/api/v1/activity', {
    method: 'POST',
    body: postData
  })

  response.result.lineUlids.forEach((ulid: string) => {
    tableStruct.insert(payload.tableUlid, { lineId: ulid })
  })

  output.lineIds = response.result.lineIds


  const endTime = performance.now()
  console.log(`[SearchLineFetchAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchLineFetchACDef = {
  name: 'SearchLineFetchAC',
  scope: 'common',
  description: 'テーブル内の行を検索する',
  dependencies: ['DeployAC'],
  apiEndpoint: '/api/v1/workflow/master'
}

