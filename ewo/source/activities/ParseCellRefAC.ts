/**
 * ParseCellRefAC Activity
 * 
 * CellRef文字列をパースする
 * 
 * Input:
 *   - cellRef: CellRef文字列（例: "table:node_xxx|lineId:123|key:value"）
 *   - isData: データテーブルのCellRefかどうか（オプション）
 * 
 * Output:
 *   - table: テーブル名
 *   - lineId: lineId
 *   - key: キー名
 *   - tableUlid: テーブルULID（node_を除いたもの）
 *   - null: パース失敗時
 */

import type { ActivityFunction } from '~/types/activity'

export interface ParseCellRefACPayload {
  cellRef: string
  isData?: boolean
}

export interface ParseCellRefACResult {
  table: string
  lineId: string
  key: string
  tableId: string | undefined
}

export const ParseCellRefAC: ActivityFunction = async (
  payload: ParseCellRefACPayload
): Promise<ParseCellRefACResult | null> => {
  const startTime = performance.now()
  console.log('[ParseCellRefAC] 実行開始:', payload)

  const { cellRef, isData } = payload
  const parts = cellRef?.split('|')
  
  if (!parts || parts.length !== 3) {
    console.log('[ParseCellRefAC] Invalid format: parts length !== 3')
    const endTime = performance.now()
    console.log(`[ParseCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, null)
    return null}
  
  const tablePart = parts[0].split(':')
  const lineIdPart = parts[1].split(':')
  const keyPart = parts[2].split(':')
  
  if (tablePart.length !== 2 || lineIdPart.length !== 2 || keyPart.length !== 2) {
    console.log('[ParseCellRefAC] Invalid format: part structure')
    const endTime = performance.now()
    console.log(`[ParseCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, null)
    return null
  }
  
  const [tableLabel, table] = tablePart
  const [lineIdLabel, lineId] = lineIdPart
  const [keyLabel, key] = keyPart
  
  // データテーブル参照を強制したい場合（isData===true）は、id ラベルであることを要求
  if (isData === true && lineIdLabel !== 'id') {
    console.log('[ParseCellRefAC] Expected data CellRef (lineId label should be id)')
    const endTime = performance.now()
    console.log(`[ParseCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, null)
    return null
  }
  
  if (tableLabel !== 'table' || (lineIdLabel !== 'lineId' && lineIdLabel !== 'id') || keyLabel !== 'key') {
    console.log('[ParseCellRefAC] Invalid labels')
    const endTime = performance.now()
    console.log(`[ParseCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, null)
    return null
  }
  
  // tableUlidを抽出（node_xxx → xxx）
  const tableId = table.match(/^_([0-9a-z]{26})$/)?.[1]
  
  const result:ParseCellRefACResult = { table, lineId, key, tableId }

  const endTime = performance.now()
  console.log(`[ParseCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const ParseCellRefACDef = {
  name: 'ParseCellRefAC',
  scope: 'common',
  description: 'CellRef文字列をパースする'
}

