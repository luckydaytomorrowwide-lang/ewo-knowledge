/**
 * ProcessLineColumnsAC Activity
 *
 * 1行に対して各カラム(N_CAT, U_CAT, DEP_ID, KEY, I_TYPE, F_TYPE, VALUE)を処理し、
 * カラムごとに2つの layoutRow を生成する（セル行 + プロパティ行）
 *
 * Input:
 *   - tableId: テーブルID
 *   - lineId: 行ID
 *   - blockKeyLine: 親ブロックキー
 *   - anchorUcat: アンカーのU_CAT
 *   - nodeId: ノードID
 *   - nodeLabels: ノードラベル配列
 *   - optionValue: オプション値（オプション）
 *
 * Output:
 *   - layoutRows: 生成された layoutRow の配列
 */

import type { ActivityFunction } from '~/types/activity'
import { RetrieveColumnAC } from './RetrieveColumnAC'
import { FirstRowAC } from './FirstRowAC'
import { BuildCellRefAC } from './BuildCellRefAC'
import { ConcatStringAC } from './ConcatStringAC'
import { SearchLayoutTemplateTypeAC } from './SearchLayoutTemplateTypeAC'
import { SearchLayoutTemplateTypeByValueAC } from './SearchLayoutTemplateTypeByValueAC'
import { BuildLayoutBlockKeyWF } from '~/workflowDefs/common/workflows/BuildLayoutBlockKeyWF'
import { BuildLayoutBlockRowWF } from '~/workflowDefs/common/workflows/BuildLayoutBlockRowWF'
import { Column } from '~/constants/Column'
import { LayoutVueType } from '~/constants/LayoutVueType'

export interface ProcessLineColumnsACPayload {
  tableId: string
  lineId: string
  blockKeyLine: string
  anchorUcat: any
  nodeId: string
  nodeLabels: string[]
  optionValue?: any
}

export interface ProcessLineColumnsACResult {
  layoutRows: any[]
}

const COLUMNS = [
  Column.N_CAT, Column.U_CAT, Column.DEP_ID,
  Column.KEY, Column.I_TYPE, Column.F_TYPE, Column.VALUE,
]

export const ProcessLineColumnsAC: ActivityFunction = async (
  payload: ProcessLineColumnsACPayload
): Promise<ProcessLineColumnsACResult> => {
  const startTime = performance.now()
  console.log('[ProcessLineColumnsAC] 実行開始:', payload)

  const layoutRows: any[] = []

  const outputRetrieveKey = await RetrieveColumnAC({
    tableId: payload.tableId,
    lineId: payload.lineId,
    column: Column.KEY,
  })
  const keyCell = await FirstRowAC({
    rows: outputRetrieveKey.columns,
  })

  for (const column of COLUMNS) {
    const outputRetrieveCol = await RetrieveColumnAC({
      tableId: payload.tableId,
      lineId: payload.lineId,
      column,
    })
    const cell = await FirstRowAC({
      rows: outputRetrieveCol.columns,
    })

    const outputBuildCellRef = await BuildCellRefAC({
      tableId: payload.tableId,
      lineId: payload.lineId,
      key: column,
    })

    const output_blockKeyCell = await BuildLayoutBlockKeyWF({
      parentKey: payload.blockKeyLine,
      blockKey: outputBuildCellRef.cellRef,
    })
    const blockKeyCell = output_blockKeyCell.blockKey

    const outputCellRow = await BuildLayoutBlockRowWF({
      tableId: payload.tableId,
      lineId: payload.lineId,
      blockKey: blockKeyCell,
      instViewType: LayoutVueType.CARD,
      instEditType: LayoutVueType.CARD,
      tplViewType: LayoutVueType.CARD,
      tplEditType: LayoutVueType.CARD,
      propertyKey: Column.U_CAT,
      propertyValue: payload.anchorUcat,
      nodeId: payload.nodeId,
      nodeLabels: payload.nodeLabels,
    })
    layoutRows.push(outputCellRow.layoutRow)

    let outputSearchTemplate: any = null
    let propertyColumn: any = null
    let propertyOptionValue: any = null

    if (column !== Column.VALUE) {
      outputSearchTemplate = await SearchLayoutTemplateTypeAC({
        lineKey: keyCell,
        column,
        anchorUcat: payload.anchorUcat,
      })
      propertyColumn = column
    } else {
      const outputRetrieveFType = await RetrieveColumnAC({
        tableId: payload.tableId,
        lineId: payload.lineId,
        column: Column.F_TYPE,
      })
      const fTypeValue = await FirstRowAC({
        rows: outputRetrieveFType.columns,
      })
      outputSearchTemplate = await SearchLayoutTemplateTypeByValueAC({
        lineKey: keyCell,
        fTypeColumn: fTypeValue,
        anchorUcat: payload.anchorUcat,
      })
      propertyColumn = fTypeValue
      propertyOptionValue = payload.optionValue
    }

    const output_blockKeyCard = await BuildLayoutBlockKeyWF({
      parentKey: payload.blockKeyLine,
      blockKey: outputBuildCellRef.cellRef,
    })

    const output_blockKey = await BuildLayoutBlockKeyWF({
      parentKey: output_blockKeyCard.blockKey,
      blockKey: outputBuildCellRef.cellRef,
    })

    const output_concat = await ConcatStringAC({
      srcStr: output_blockKey.blockKey,
      separator: '+',
      destStr: outputBuildCellRef.cellRef,
    })

    const outputPropRow = await BuildLayoutBlockRowWF({
      tableId: payload.tableId,
      lineId: payload.lineId,
      blockKey: output_concat.str,
      anchorUcat: payload.anchorUcat,
      lineKey: keyCell,
      column: propertyColumn,
      instViewType: outputSearchTemplate.instViewType,
      instEditType: outputSearchTemplate.instEditType,
      instSelectType: outputSearchTemplate.instSelectType,
      tplViewType: outputSearchTemplate.tplViewType,
      tplEditType: outputSearchTemplate.tplEditType,
      tplSelectType: outputSearchTemplate.tplSelectType,
      propertyKey: column,
      propertyValue: cell,
      nodeId: payload.nodeId,
      nodeLabels: payload.nodeLabels,
      option: propertyOptionValue,
    })
    layoutRows.push(outputPropRow.layoutRow)
  }

  const output: ProcessLineColumnsACResult = { layoutRows }

  const endTime = performance.now()
  console.log(`[ProcessLineColumnsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ProcessLineColumnsACDef = {
  name: 'ProcessLineColumnsAC',
  scope: 'common',
  description: '1行の各カラムを処理してlayoutRowsを生成する',
}
