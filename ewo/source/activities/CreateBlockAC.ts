/**
 * CreateBlockAC Activity
 * 
 * ブロックのキーを作成する
 * 
 * Input:
 *   - tableId: テーブルID
 *   - firstBlockId: テーブルrootブロックlineID
 *   - anchorLineId アンカーラインID
 * 
 * Output:
 *   - result: 作成結果
 */

import type { ActivityFunction } from '~/types/activity'
import { SearchLineAC, FirstRowAC, RetrieveColumnAC } from '~/workflowDefs/common/activities'

export interface CreateBlockACPayload {
  tableId: string
  firstBlockId?: string
  anchorLineId?: string
}

export interface CreateBlockACResult {
  key: string
}

export const CreateBlockAC: ActivityFunction = async (
  payload: CreateBlockACPayload
): Promise<CreateBlockACResult> => {
  const startTime = performance.now()
  console.log('[CreateBlockAC] 実行開始:', payload)

  const output: CreateBlockACResult = { key: null }

  if (payload.tableId && payload.firstBlockId) {
    const table = payload.tableId.match(/^([^_]+)/g)[0]
    output.key = table + '[' + payload.firstBlockId + ']'

  } else if (payload.anchorLineId) {
    const _output_varNameLineIds = await SearchLineAC({
      tableId: payload.tableId,
      tableType: 3,
      key: 'VAR_NAME',
      parentId: payload.anchorLineId,
    })
    const _output_varNameLineId = await FirstRowAC({
      rows: _output_varNameLineIds.lineIds,
    })
    const _output_valueColumns = await RetrieveColumnAC({
      tableId: payload.tableId,
      tableType: 3,
      lineId: _output_varNameLineId,
      column: 'value',
    })
    const _output_valueColumn = await FirstRowAC({
      rows: _output_valueColumns.columns,
    })

    output.key = _output_valueColumn + '[' + payload.firstBlockId + ']'
  }

  
  const result = { result: response.result }

  const endTime = performance.now()
  console.log(`[CreateBlockAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateBlockACDef = {
  name: 'CreateBlockAC',
  scope: 'common',
  description: '新しいエッジ（関係）を作成する',
  apiEndpoint: '/api/v1/activity'
}

