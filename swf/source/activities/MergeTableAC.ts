/**
 * MergeTableAC Activity
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
import { useRdbStore } from '~/stores/rdb'
import { RestoreCellRefAC } from './RestoreCellRefAC'
import { ParseToArrayAC } from './ParseToArrayAC'
import alasql from 'alasql'
import type {RetrieveTableACResult} from "~/workflowDefs/common/activities/RetrieveTableAC";
import {RetrieveCellrefAC} from "~/workflowDefs/common/activities/RetrieveCellrefAC";

export interface MergeTableACPayload {
  structTableId: string
  dataTableId: string
}

export interface MergeTableACResult {
  rows: StructRow[]
}

export const MergeTableAC: ActivityFunction = async (
  payload: MergeTableACPayload
): Promise<MergeTableACResult> => {
  const startTime = performance.now()
  console.log('[MergeTableAC] 実行開始:', payload)

  const { structTableId, dataTableId } = payload
  const rdb = useRdbStore()

  const output: MergeTableACResult = { rows: [] }
  const rows = [] as StructRow[]

    // Todo
    // if (tableTemporary.byTable(tableId).length > 0) {
    //     output.rows = tableTemporary.byTable(tableId)
    //     return output
    // }



  // 構造データを取得
  const structRows = rdb.byTable(structTableId)
  
  for (const row of structRows) {
    // データを取得してマージ
    const dataRows = alasql('SELECT * FROM ? WHERE line_id = ?',
      [rdb.byTable(dataTableId), row.line_id])
    // const dataRows = rdb.byTable(dataTableId)

    for (const result of dataRows) {
      if (result.key === 'dep_id') {
        // dep_idは配列にパース
        row[result.key] = await ParseToArrayAC({ text: result.actual1 || row[result.key] })
      }
      // Todo
      else if (result.key === 'n_cat' || result.key === 'u_cat' || result.key === 'key'){
        const _output = await RetrieveCellrefAC({ cellref: result.actual1 || row[result.key] })
        row[result.key] = _output.value
      }
      else {
        // その他は CellRef を復元
        // row[result.key] = await RestoreCellRefAC({ cellRef: result.actual1 })

        // row[result.key] = result.actual1

        const _output = await RetrieveCellrefAC({ cellref: result.actual1 || row[result.key] })
        row[result.key] = _output.value
      }
    }
    
    rows.push(row)
  }

  output.rows = rows
  
  const endTime = performance.now()
  console.log(`[MergeTableAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const MergeTableACDef = {
  name: 'MergeTableAC',
  scope: 'common',
  description: 'テーブルをデプロイ（構造とデータをマージ）する',
  dependencies: ['RestoreCellRefAC', 'ParseToArrayAC']
}

