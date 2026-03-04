/**
 * RetrieveTableAC Activity
 *
 * テーブルを取得する
 *
 * Input:
 *   - tableId: テーブルID
 *   - searchType: 検索タイプ（1: 全件, 2: 指定lineId配下）
 *   - lineId: searchType=2 の場合の基点となる lineId
 *   - depth: 再帰の深さ（searchType=2 の場合）
 *
 * Output:
 *   { rows: { [tableName]: rows[] } }
 */

import { ofetch } from 'ofetch'
import type { ActivityFunction } from '~/types/activity'
import { useRdbStore } from '~/stores/rdb'
import type { StructRow } from '~/stores/tableStruct'
import type { DataRow } from '~/stores/tableData'

export interface RetrieveTableACPayload {
  tableId: string
  searchType?: number
  lineId?: string
  depth?: number
}

export interface RetrieveTableACResult {
  rows: any[]
}

export const RetrieveTableAC: ActivityFunction = async (
  payload: RetrieveTableACPayload
): Promise<RetrieveTableACResult> => {
  const startTime = performance.now()
  console.log('[RetrieveTableAC] 実行開始:', payload)

  const { tableId, searchType, lineId, depth } = payload
  const rdb = useRdbStore()

  const output: RetrieveTableACResult = { rows: [] }

  // 構造テーブル名の特定 (Laravel側のTableService::isTypeStruct相当)
  const isTypeStruct = (tid: string): boolean => {
    return !tid.includes('_data')
  }

  let tempTableId = tableId
  if (!isTypeStruct(tableId)) {
    tempTableId = tableId
      .replace('_data', '_structs')
  }

  // Piniaストアから全行取得
  let allRows = rdb.byTable(tempTableId) as StructRow[]
  console.log('[RetrieveTableAC] allRows count:', allRows.length)

  // データがなければAPIから取得
  if (allRows.length === 0 || (searchType === 2 && lineId && !allRows.find(r => r.line_id === lineId))) {
    console.log('[RetrieveTableAC] ストアにデータがないため、APIから取得します')
    // API呼び出し
    const postData: Record<string, any> = {
      workflow: 'RetrieveTableAC',
      tableId: payload.tableId,
      searchType: payload.searchType,
      lineId: payload.lineId,
      depth: payload.depth,
    }
    const response = await ofetch('http://localhost:8000/api/v1/activity', {
      method: 'POST',
      body: postData
    })
    console.log('[RetrieveTableAC] APIレスポンス:', response)

    if (response?.result?.rows) {
      // ストアに保存（キャッシュ）
      rdb.insert(payload.tableId, response.result.rows as StructRow[])
      allRows = response.result.rows as StructRow[]
    }
  }

  let rows: StructRow[] = []

  if (!searchType || searchType === 1) {
    rows = allRows
  } else if (searchType === 2 && lineId) {
    // searchType=2 の場合、lineId で指定された行配下の行を返す
    const resultRows: StructRow[] = []

    // 指定された lineId 自体を取得対象に含める
    const selfRow = allRows.find(r => r.line_id === lineId)
    if (selfRow) {
      resultRows.push(selfRow)
    }

    const fetchChildren = (parentId: string, currentDepth: number) => {
      if (depth !== undefined && depth !== null && currentDepth >= depth) {
        return
      }

      const children = allRows.filter(r => r.parent_id === parentId)
      for (const child of children) {
        resultRows.push(child)
        fetchChildren(child.line_id, currentDepth + 1)
      }
    }

    if (depth === undefined || depth === null || depth > 0) {
      fetchChildren(lineId, 0)
    }
    rows = resultRows
  }

  // フィルタリング (Laravel側の $filterRows 相当)
  // TypeScriptではpluck().all()相当をmapで行う
  const filterRows = rows.map(row => ({
    id: (row as any).id,
    line_id: row.line_id,
    n_cat: row.n_cat,
    u_cat: row.u_cat,
    parent_id: row.parent_id,
    dep_id: row.dep_id,
    key: row.key,
    i_type: row.i_type,
    f_type: row.f_type,
    value: row.value,
  }))

  console.log('[RetrieveTableAC] filterRows count:', filterRows.length)

  if (isTypeStruct(tableId)) {
    output.rows = filterRows
  } else {
    // データテーブルの場合
    const lineIds = [...new Set(filterRows.map(r => r.line_id))]
    console.log('[RetrieveTableAC] lineIds:', lineIds)

    let dataRows = rdb.byTable(tableId) as DataRow[]

    // データがなければAPIから取得
    if (dataRows.length === 0 || lineIds.some(lid => !dataRows.some(dr => dr.line_id === lid))) {
      console.log('[RetrieveTableAC] データテーブルのストアにデータがないため、APIから取得します')
      const postData: Record<string, any> = {
        workflow: 'RetrieveTableAC',
        tableId: payload.tableId,
        searchType: payload.searchType,
        lineId: payload.lineId,
        depth: payload.depth,
      }
      const response = await ofetch('http://localhost:8000/api/v1/activity', {
        method: 'POST',
        body: postData
      })
      console.log('[RetrieveTableAC] データテーブル APIレスポンス:', response)

      if (response?.result?.rows) {
        // ストアに保存（キャッシュ）
        rdb.insert(payload.tableId, response.result.rows as DataRow[])
        dataRows = response.result.rows as DataRow[]
      }
    }
    
    for (const dataRow of dataRows) {
      if (!lineIds.includes(dataRow.line_id as string)) {
        continue
      }

      output.rows.push({
        id: dataRow.id,
        table: (dataRow as any).table,
        line_id: dataRow.line_id,
        key: dataRow.key,
        actual1: (dataRow as any).actual1,
      })
    }
  }
  
  const endTime = performance.now()
  console.log(`[RetrieveTableAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const RetrieveTableACDef = {
  name: 'RetrieveTableAC',
  scope: 'common',
  description: 'テーブルを取得する',
  apiEndpoint: '/api/v1/activity' // API呼び出しを行うようにしたので設定を戻す
}

