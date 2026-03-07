/**
 * GetTableUlidByJsonAC Activity
 * 
 * JSONオブジェクトからテーブルULIDを取得する
 * 
 * Input:
 *   - struct: { [tableName]: StructRow[] } (オプション)
 *   - data: { [tableName]: DataRow[] } (オプション)
 *   - lineId: テーブルのラインID（オプション）
 * 
 * Output:
 *   - tableUlid: テーブルのULID
 */

import type { ActivityFunction } from '~/types/activity'

export interface GetTableUlidByJsonACPayload {
  json: any
}
export interface GetTableUlidByJsonACResult {
    tableUlid: string
}

export const GetTableUlidByJsonAC: ActivityFunction = async (
  payload: GetTableUlidByJsonACPayload | any
): Promise<GetTableUlidByJsonACResult> => {
  const startTime = performance.now()
  console.log('[GetTableUlidByJsonAC] 実行開始:', payload)
  
  let tableUlid: string | undefined = payload?.json?.lineId

  if (!tableUlid) {
    console.warn('[GetTableUlidByJsonAC] tableUlidが見つかりません。payloadの例:', payload)
    throw new Error('GetTableUlidByJsonAC: tableUlid を特定できませんでした。payload.lineId または json.lineId を指定してください。')
  }

  const output: GetTableUlidByJsonACResult = { tableUlid }

  const endTime = performance.now()
  console.log(`[GetTableUlidByJsonAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetTableUlidByJsonACDef = {
  name: 'GetTableUlidByJsonAC',
  scope: 'common',
  description: 'JSONオブジェクトからテーブルULIDを取得する',
}

