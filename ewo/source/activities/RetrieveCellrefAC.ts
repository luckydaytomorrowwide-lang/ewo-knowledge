/**
 * RetrieveCellrefAC Activity
 *
 * CellRefを解決して値を返す
 * サーバー側の RetrieveCellrefAC を呼び出す
 *
 * Input:
 *   - cellRef: string
 *
 * Output:
 *   { value: mixed }
 */

import { ofetch } from 'ofetch'
import type { ActivityFunction } from '~/types/activity'
import {ParseCellRefAC} from "~/workflowDefs/common/activities/ParseCellRefAC";

export interface RetrieveCellrefACPayload {
  cellref: string
}

export interface RetrieveCellrefACResult {
  value: any
}

export const RetrieveCellrefAC: ActivityFunction = async (
  payload: RetrieveCellrefACPayload
): Promise<RetrieveCellrefACResult> => {
  const startTime = performance.now()
  console.log('[RetrieveCellrefAC] 実行開始:', payload)

  const { cellref } = payload

  const _output = await ParseCellRefAC({cellRef: cellref})
  if (_output === null) return {value: cellref}

  // API呼び出し
  const postData: Record<string, any> = {
    workflow: 'RetrieveCellrefAC',
    cellRef: cellref,
  }

  try {
    const response = await ofetch('http://localhost:8000/api/v1/activity', {
      method: 'POST',
      body: postData
    })
    console.log('[RetrieveCellrefAC] APIレスポンス:', response)

    if (response?.status === 'OK' && response?.result) {
      const endTime = performance.now()
      console.log(`[RetrieveCellrefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`)
      return {
        value: response.result.value
      }
    } else {
      console.warn('[RetrieveCellrefAC] APIエラーまたは不正なレスポンス:', response)
      const endTime = performance.now()
      console.log(`[RetrieveCellrefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`)
      return {
        value: null
      }
    }
  } catch (error) {
    console.error('[RetrieveCellrefAC] API呼び出し失敗:', error)
    const endTime = performance.now()
    console.log(`[RetrieveCellrefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`)
    return {
      value: null
    }
  }
}

export const RetrieveCellrefACDef = {
  name: 'RetrieveCellrefAC',
  scope: 'common',
  description: 'CellRefを解決して値を返す',
  apiEndpoint: '/api/v1/activity'
}
