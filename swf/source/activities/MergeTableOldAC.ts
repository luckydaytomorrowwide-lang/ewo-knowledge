/**
 * MergeTableOldAC Activity
 * 
 * テーブルをデプロイ（構造とデータをマージ）する
 * 
 * Input:
 *   - tableUlid: テーブルULID
 * 
 * Output:
 *   デプロイされたStructRow配列
 */

import type { ActivityFunction } from '~/types/activity'
import type { StructRow } from '~/stores/tableStruct'
import { useTableStructStore } from '~/stores/tableStruct'
import { useTableDataStore } from '~/stores/tableData'
import { useTableTemporaryStore } from '~/stores/tableTemporary'
import { RestoreCellRefAC } from './RestoreCellRefAC'
import { ParseToArrayAC } from './ParseToArrayAC'
import alasql from 'alasql'
import type {RetrieveTableACResult} from "~/workflowDefs/common/activities/RetrieveTableAC";

export interface MergeTableOldACPayload {
    tableId: string
}

export interface MergeTableOldACResult {
  rows: StructRow[]
}

export const MergeTableOldAC: ActivityFunction = async (
  payload: MergeTableOldACPayload
): Promise<MergeTableOldACResult> => {
  const startTime = performance.now()
  console.log('[MergeTableOldAC] 実行開始:', payload)

  const { tableId } = payload
  const tableStruct = useTableStructStore()
  const tableData = useTableDataStore()
  const tableTemporary = useTableTemporaryStore()

  const output: MergeTableOldACResult = { rows: [] }
  const rows = [] as StructRow[]

    // Todo
    if (tableTemporary.byTable(tableId).length > 0) {
        output.rows = tableTemporary.byTable(tableId)
        return output
    }



  // 構造データを取得
  const structRows = tableStruct.byTable('table_struct_' + tableId.toLowerCase())
  
  for (const row of structRows) {
    // データを取得してマージ
    const results = alasql('SELECT * FROM ? WHERE line_id = ?',
      [tableData.byTable('table_data_' + tableId.toLowerCase()), row.line_id])
    
    for (const result of results) {
      if (result.key === 'dep_id') {
        // dep_idは配列にパース
        row[result.key] = await ParseToArrayAC({ text: result.actual1 || row[result.key] })
      } else {
        // その他は CellRef を復元
        row[result.key] = await RestoreCellRefAC({ cellRef: result.actual1 })
      }
    }
    
    rows.push(row)
  }

  output.rows = rows

  console.log('[MergeTableOldAC] 完了:', rows.length, '行')

  const endTime = performance.now()
  console.log(`[MergeTableOldAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const MergeTableOldACDef = {
  name: 'MergeTableOldAC',
  scope: 'common',
  description: 'テーブルをデプロイ（構造とデータをマージ）する',
  dependencies: ['RestoreCellRefAC', 'ParseToArrayAC']
}

