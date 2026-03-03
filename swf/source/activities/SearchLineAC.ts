/**
 * SearchLineAC Activity
 * 
 * テーブル内の行を検索する
 * 
 * Input:
 *   - searchType: 検索タイプ（'condition', 'type', etc.）
 *   - tableType: テーブルタイプ（1: Struct, 2: Data, 3: Deploy）
 *   - tableUlid: テーブルULID
 *   - lineId: 行ID（オプション）
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
 *   - lineIds: 検索結果の行ID配列
 */

import { toRaw } from 'vue';
import type { ActivityFunction } from '~/types/activity'
import type { StructRow } from '~/stores/tableStruct'
import { useTableStructStore } from '~/stores/tableStruct'
import { useTableDataStore } from '~/stores/tableData'
import { useRdbStore } from '~/stores/rdb'
import { MergeTableAC } from './MergeTableAC'
import alasql from 'alasql'

export interface SearchLineACPayload {
  searchType?: string
  tableType?: number
  tableId: string
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

  configId?: string
}

export interface SearchLineACResult {
  lineIds: string[]
}

export const SearchLineAC: ActivityFunction = async (
  payload: SearchLineACPayload
): Promise<SearchLineACResult> => {
  const startTime = performance.now()
  console.log('[SearchLineAC] 実行開始:', payload)

  const tableStruct = useTableStructStore()
  const tableData = useTableDataStore()
  const rdb = useRdbStore()
  let rows: StructRow[]
  const output: SearchLineACResult = { lineIds: [] }
  
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
  if (payload.searchType === 'condition' || !payload.searchType) {
    let sql = `SELECT line_id FROM ?`
    const wheres: string[] = []
    const bindings: any[] = [
        rows.map((row: any) => toRaw(row))
    ]

    if (payload.lineId) {
      wheres.push('line_id = ?')
      bindings.push(payload.lineId)
    }

    if (payload.parentId) {
      wheres.push("REPLACE(parent_id, '.ulid', '') = ?")
      bindings.push(payload.parentId.replace('.ulid', ''))
    }
    
    if (payload.nCat) {
      wheres.push('n_cat = ?')
      bindings.push(payload.nCat)
    }
    
    if (payload.uCat) {
      wheres.push('u_cat = ?')
      bindings.push(payload.uCat)
    }
    
    if (payload.key) {
      wheres.push('key = ?')
      bindings.push(payload.key)
    }
    
    if (payload.table) {
      wheres.push('`table` = ?')
      bindings.push(payload.table)
    }
    
    // 追加パラメータ（depId, iType, fType, value）のローカル検索条件
    if (payload.depId) {
      wheres.push('dep_id = ?')
      bindings.push(payload.depId)
    }
    if (payload.iType) {
      wheres.push('i_type = ?')
      bindings.push(payload.iType)
    }
    if (payload.fType) {
      wheres.push('f_type = ?')
      bindings.push(payload.fType)
    }
    if (typeof payload.value !== 'undefined') {
      wheres.push('`value` = ?')
      bindings.push(payload.value)
    }

    if (payload.configId) {
      wheres.push('config_id = ?')
      bindings.push(payload.configId)
    }

    if (wheres.length > 0) {
      sql += ' WHERE ' + wheres.join(' AND ')

      // Todo
      // sql += ' AND `value` IS NOT NULL '
    }

    console.log('[SearchLineAC] SQL:', sql, bindings)

    const results = alasql(sql, bindings)
    output.lineIds = results.map((r: any) => r.line_id)

  }

  const endTime = performance.now()
  console.log(`[SearchLineAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchLineACDef = {
  name: 'SearchLineAC',
  scope: 'common',
  description: 'テーブル内の行を検索する',
  dependencies: ['DeployAC'],
  apiEndpoint: '/api/v1/workflow/master'
}

