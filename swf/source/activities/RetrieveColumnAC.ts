/**
 * RetrieveColumnAC Activity
 * 
 * 特定のカラムの値を取得する
 * 
 * Input:
 *   - searchType: 検索タイプ（'condition', 'raw', etc.）
 *   - tableType: テーブルタイプ（1: Struct, 2: Data, 3: Deploy）
 *   - tableUlid: テーブルULID
 *   - lineId: 行ULID（オプション）
 *   - column: カラム名
 *   - mode: モード（オプション）
 *   - keys: キー（オプション）
 * 
 * Output:
 *   - columns: 検索結果のカラム値配列
 */

import type { ActivityFunction } from '~/types/activity'
import type { StructRow } from '~/stores/tableStruct'
import { useTableStructStore } from '~/stores/tableStruct'
import { useTableDataStore } from '~/stores/tableData'
import { useRdbStore } from '~/stores/rdb'
import { MergeTableAC } from './MergeTableAC'
import alasql from 'alasql'

export interface RetrieveColumnACPayload {
  searchType?: string
  tableType?: number
  tableId: string
  lineId: string
  column: string
  mode?: string
  keys?: string
}

export interface RetrieveColumnACResult {
  columns: any[]
}

export const RetrieveColumnAC: ActivityFunction = async (
  payload: RetrieveColumnACPayload
): Promise<RetrieveColumnACResult> => {
  const startTime = performance.now()
  console.log('[RetrieveColumnAC] 実行開始:', payload)

  const tableStruct = useTableStructStore()
  const tableData = useTableDataStore()
  const rdb = useRdbStore()
  let rows: StructRow[]
  const output: RetrieveColumnACResult = { columns: [] }
  
  // テーブルタイプに応じてデータを取得
  switch (payload.tableType) {
    case 1:
      rows = tableStruct.byTable(payload.tableId)
      break
    case 2:
      rows = tableData.byTable(payload.tableId) as any[]
      break
    case 3:
      const _output = await MergeTableAC({ tableId: payload.tableId })
      rows = _output.rows
      break
    default:
      rows = rdb.byTable(payload.tableId) as any[]
  }
  
  // 検索タイプに応じて処理
  if (payload.lineId) {
    let sql = `SELECT ${payload.column} FROM ?`
    const wheres: string[] = []
    const bindings: any[] = [rows]
    
    if (payload.lineId) {
      wheres.push('line_id = ?')
      bindings.push(payload.lineId)
    }
    
    if (wheres.length > 0) {
      sql += ' WHERE ' + wheres.join(' AND ')
    }
    
    console.log('[RetrieveColumnAC] SQL:', sql, bindings)
    
    const results = alasql(sql, bindings)
    output.columns = results.map((r: any) => r[payload.column])
  }
  else {
    output.columns = []
  }
  
  const endTime = performance.now()
  console.log(`[RetrieveColumnAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const RetrieveColumnACDef = {
  name: 'RetrieveColumnAC',
  scope: 'common',
  description: '特定のカラムの値を取得する',
  dependencies: ['DeployAC'],
}

