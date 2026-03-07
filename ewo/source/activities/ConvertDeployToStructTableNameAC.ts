/**
 * ConvertDeployToStructTableNameAC Activity
 * 
 * テーブル名の 2番目以降のセグメントを除去し、'_structs' を付与することで、
 * 強制的に struct テーブル名に正規化する。
 * 
 * Input:
 *   - tableId: 変換前のテーブルID (例: 'baseinfo_deploy_XXX', 'baseinfo_anything_XXX', 'baseinfo_XXX')
 * 
 * Output:
 *   - tableId: 変換後のテーブルID (例: 'baseinfo_structs')
 */

import type { ActivityFunction } from '~/types/activity'

export interface ConvertDeployToStructTableNameACPayload {
  tableId: string
}

export interface ConvertDeployToStructTableNameACResult {
  tableId: string
}

export const ConvertDeployToStructTableNameAC: ActivityFunction = async (
  payload: ConvertDeployToStructTableNameACPayload
): Promise<ConvertDeployToStructTableNameACResult> => {
  const startTime = performance.now()
  console.log('[ConvertDeployToStructTableNameAC] 実行開始:', payload)

  const tableId = payload.tableId
  
  // テーブル名が parts[0]_parts[1]_parts[2]... の形式であると仮定
  // 最初の要素（プレフィックス部分）のみを残し、その後に _structs を付与する
  const parts = tableId.split('_')
  let tableStructId = tableId

  if (parts.length >= 2) {
    // 例: baseinfo_deploy_XXX -> baseinfo_structs
    // 例: baseinfo_XXX -> baseinfo_structs
    // 例: my_custom_table_name_XXX -> my_structs
    tableStructId = `${parts[0]}_structs`
  }
  // 要素が1つ以下の場合は変換不能としてそのまま（あるいは必要ならプレフィックス付与だが現状維持）

  const output: ConvertDeployToStructTableNameACResult = {
    tableId: tableStructId
  }

  const endTime = performance.now()
  console.log(`[ConvertDeployToStructTableNameAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ConvertDeployToStructTableNameACDef = {
  name: 'ConvertDeployToStructTableNameAC',
  scope: 'common',
  description: 'テーブル名の 2番目以降のセグメントを除去し、struct に強制変換する',
}
