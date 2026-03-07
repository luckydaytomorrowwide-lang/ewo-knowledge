/**
 * RestoreCellRefAC Activity
 * 
 * CellRefを実値に復元する（再帰的）
 * 
 * Input:
 *   - cellRef: CellRef文字列または実値
 *   - depth: 再帰の深さ（オプション、デフォルト: 0）
 * 
 * Output:
 *   復元された実値
 */

import type { ActivityFunction } from '~/types/activity'
import { ParseCellRefAC } from './ParseCellRefAC'
import { useTableDataStore } from '~/stores/tableData'
import type { DataRow } from '~/stores/tableData'
import alasql from 'alasql'

export interface RestoreCellRefACPayload {
  cellRef: string
  depth?: number
}

export const RestoreCellRefAC: ActivityFunction = async (
  payload: RestoreCellRefACPayload
): Promise<unknown> => {
  const startTime = performance.now()
  console.log('[RestoreCellRefAC] 実行開始:', payload)

  const { cellRef, depth = 0 } = payload
  
  // 無限ループ防止（最大10階層）
  if (depth > 10) {
    console.warn('[RestoreCellRefAC] Max depth reached')
    const endTime = performance.now()
    console.log(`[RestoreCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, cellRef)
    return cellRef
}
  
  // ParseCellRefAC を使用してパース
  const parsed = await ParseCellRefAC({ cellRef })
  
  // CellRefでなければ、そのまま返す（実値）
  if (!parsed) {
    console.log('[RestoreCellRefAC] Not a CellRef, returning ' + cellRef)
    const endTime = performance.now()
    console.log(`[RestoreCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, cellRef)
    return cellRef
  }
  
  const { table, lineId, key } = parsed
  
  // ストアから表データを取得
  const tableData = useTableDataStore()
  
  // alasql 実行
  const results = alasql('SELECT * FROM ? WHERE id = ? LIMIT 1',
    [tableData.rows?.[table], parseInt(lineId)]) as DataRow[] | unknown
  
  if (!results || (results as DataRow[]).length === 0) {
    console.info(`[RestoreCellRefAC] Table ${table} not found for lineId ${lineId}`)
    const endTime = performance.now()
    console.log(`[RestoreCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, cellRef)
    return cellRef
  }
  
  const row = (results as DataRow[])[0]

  console.log('[RestoreCellRefAC] row:', row)

  // 再帰的に復元
  const result = await RestoreCellRefAC({ 
    cellRef: row[key], 
    depth: depth + 1 
  })

  const endTime = performance.now()
  console.log(`[RestoreCellRefAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const RestoreCellRefACDef = {
  name: 'RestoreCellRefAC',
  scope: 'common',
  description: 'CellRefを実値に復元する（再帰的）',
  dependencies: ['ParseCellRefAC']
}

