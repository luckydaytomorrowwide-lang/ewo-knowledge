/**
 * RetrieveButtonPropertiesAC Activity
 *
 * ボタン設定の各プロパティ（label, jointId, display, snackingConfigId,
 * layoutMapConfigId, buttonConfigId）を一括取得する
 *
 * Input:
 *   - tableId: ボタンテーブルID
 *   - parentId: ボタンアンカー行ID
 *
 * Output:
 *   - properties: { label, jointId, display, snackingConfigId, layoutMapConfigId, buttonConfigId }
 */

import type { ActivityFunction } from '~/types/activity'
import { SearchLineAC } from './SearchLineAC'
import { FirstRowAC } from './FirstRowAC'
import { RetrieveColumnAC } from './RetrieveColumnAC'
import { Column } from '~/constants/Column'
import { Key } from '~/constants/Key'

export interface RetrieveButtonPropertiesACPayload {
  tableId: string
  parentId: string
}

export interface RetrieveButtonPropertiesACResult {
  properties: Record<string, any>
}

const BUTTON_KEYS = [
  Key.LABEL,
  Key.JOINT_ID,
  Key.DISPLAY,
  Key.SNACKING_CONFIG_ID,
  Key.LAYOUT_MAP_CONFIG_ID,
  Key.BUTTON_CONFIG_ID,
]

export const RetrieveButtonPropertiesAC: ActivityFunction = async (
  payload: RetrieveButtonPropertiesACPayload
): Promise<RetrieveButtonPropertiesACResult> => {
  const startTime = performance.now()
  console.log('[RetrieveButtonPropertiesAC] 実行開始:', payload)

  const properties: Record<string, any> = {}

  for (const key of BUTTON_KEYS) {
    const output_searchLine = await SearchLineAC({
      tableId: payload.tableId,
      key,
      parentId: payload.parentId,
    })

    const lineId = await FirstRowAC({
      rows: output_searchLine.lineIds,
    })

    if (lineId == null) {
      properties[key] = null
      continue
    }

    const output_retrieve = await RetrieveColumnAC({
      tableId: payload.tableId,
      lineId,
      column: Column.VALUE,
    })

    const value = await FirstRowAC({
      rows: output_retrieve.columns,
    })

    properties[key] = value
  }

  const output: RetrieveButtonPropertiesACResult = { properties }

  const endTime = performance.now()
  console.log(`[RetrieveButtonPropertiesAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const RetrieveButtonPropertiesACDef = {
  name: 'RetrieveButtonPropertiesAC',
  scope: 'common',
  description: 'ボタン設定の各プロパティを一括取得する',
}
