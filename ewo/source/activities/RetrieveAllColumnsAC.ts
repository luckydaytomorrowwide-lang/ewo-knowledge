/**
 * RetrieveAllColumnsAC Activity
 *
 * 指定行の全主要カラム値を一括取得する
 * 内部で RetrieveColumnAC + FirstRowAC を各カラムに対して呼び出し、
 * cellref系カラムは RetrieveCellrefAC で値を解決する
 *
 * Input:
 *   - tableId: テーブルID
 *   - lineId: 行ID
 *
 * Output:
 *   - columns: { key, nCat, uCat, parentId, depId, iType, fType, value } のオブジェクト
 */

import type { ActivityFunction } from '~/types/activity'
import { RetrieveColumnAC } from './RetrieveColumnAC'
import { FirstRowAC } from './FirstRowAC'
import { RetrieveCellrefAC } from './RetrieveCellrefAC'
import { Column } from '~/constants/Column'

export interface RetrieveAllColumnsACPayload {
  tableId: string
  lineId: string
}

export interface RetrieveAllColumnsACResult {
  columns: Record<string, any>
}

const COLUMNS_TO_RETRIEVE = [
  Column.KEY, Column.N_CAT, Column.U_CAT,
  Column.PARENT_ID, Column.DEP_ID,
  Column.I_TYPE, Column.F_TYPE, Column.VALUE,
]

const CELLREF_COLUMNS = [
  Column.N_CAT, Column.U_CAT,
  Column.I_TYPE, Column.F_TYPE, Column.VALUE,
]

function toCamelCase(str: string): string {
  return str
    .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toLowerCase())
}

export const RetrieveAllColumnsAC: ActivityFunction = async (
  payload: RetrieveAllColumnsACPayload
): Promise<RetrieveAllColumnsACResult> => {
  const startTime = performance.now()
  console.log('[RetrieveAllColumnsAC] 実行開始:', payload)

  const columns: Record<string, any> = {}

  for (const column of COLUMNS_TO_RETRIEVE) {
    const output_retrieve = await RetrieveColumnAC({
      tableId: payload.tableId,
      lineId: payload.lineId,
      column,
    })
    const firstRow = await FirstRowAC({
      rows: output_retrieve.columns,
    })

    const camelKey = toCamelCase(column)

    if (CELLREF_COLUMNS.includes(column)) {
      const output_cellref = await RetrieveCellrefAC({
        cellref: firstRow,
      })
      columns[camelKey] = output_cellref.value
    } else {
      columns[camelKey] = firstRow
    }
  }

  const output: RetrieveAllColumnsACResult = { columns }

  const endTime = performance.now()
  console.log(`[RetrieveAllColumnsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const RetrieveAllColumnsACDef = {
  name: 'RetrieveAllColumnsAC',
  scope: 'common',
  description: '指定行の全主要カラム値を一括取得する',
}
