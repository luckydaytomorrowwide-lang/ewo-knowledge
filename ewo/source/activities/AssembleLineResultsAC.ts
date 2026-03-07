/**
 * AssembleLineResultsAC Activity
 *
 * 1つの行と複数のカラム行を結合して lineResults を構築する
 *
 * Input:
 *   - lineRow: 単一の行オブジェクト（オプション）
 *   - columnRows: カラム行の配列（オプション）
 *
 * Output:
 *   - layoutRows: [lineRow, ...columnRows]
 */

import type { ActivityFunction } from '~/types/activity'

export interface AssembleLineResultsACPayload {
  lineRow?: any
  columnRows?: any[]
}

export interface AssembleLineResultsACResult {
  layoutRows: any[]
}

export const AssembleLineResultsAC: ActivityFunction = async (
  payload: AssembleLineResultsACPayload
): Promise<AssembleLineResultsACResult> => {
  const startTime = performance.now()
  console.log('[AssembleLineResultsAC] 実行開始:', payload)

  const result: any[] = []

  if (payload.lineRow != null) {
    result.push(payload.lineRow)
  }

  if (Array.isArray(payload.columnRows)) {
    result.push(...payload.columnRows)
  }

  const output: AssembleLineResultsACResult = { layoutRows: result }

  const endTime = performance.now()
  console.log(`[AssembleLineResultsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const AssembleLineResultsACDef = {
  name: 'AssembleLineResultsAC',
  scope: 'common',
  description: 'lineRowとcolumnRowsを結合してlayoutRowsを構築する',
}
