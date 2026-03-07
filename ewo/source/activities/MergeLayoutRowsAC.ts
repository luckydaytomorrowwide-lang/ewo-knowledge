/**
 * MergeLayoutRowsAC Activity
 *
 * 複数の layoutRows 配列を1つに結合する
 *
 * Input:
 *   - arrays: 結合する配列の配列（例: [[row1], [row2, row3], [row4]]）
 *   - row: 単一の行（先頭に追加、オプション）
 *
 * Output:
 *   - layoutRows: 結合された配列
 */

import type { ActivityFunction } from '~/types/activity'

export interface MergeLayoutRowsACPayload {
  arrays?: any[][]
  row?: any
}

export interface MergeLayoutRowsACResult {
  layoutRows: any[]
}

export const MergeLayoutRowsAC: ActivityFunction = async (
  payload: MergeLayoutRowsACPayload
): Promise<MergeLayoutRowsACResult> => {
  const startTime = performance.now()
  console.log('[MergeLayoutRowsAC] 実行開始:', payload)

  const result: any[] = []

  if (payload.row != null) {
    result.push(payload.row)
  }

  if (Array.isArray(payload.arrays)) {
    for (const arr of payload.arrays) {
      if (Array.isArray(arr)) {
        result.push(...arr)
      }
    }
  }

  const output: MergeLayoutRowsACResult = { layoutRows: result }

  const endTime = performance.now()
  console.log(`[MergeLayoutRowsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const MergeLayoutRowsACDef = {
  name: 'MergeLayoutRowsAC',
  scope: 'common',
  description: '複数のlayoutRows配列を1つに結合する',
}
