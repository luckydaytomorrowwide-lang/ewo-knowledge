/**
 * MakeBlockAC Activity
 * 
 * ブロックマスターとライン情報から、ブロックデータを構築する
 * 
 * Input:
 *   - masterBlock: ブロックマスター名（'root', 'tab', 'section', 'field', 'button'）
 *   - tableUlid: テーブルULID
 *   - anchorUlid: アンカーULID
 *   - lineIds: ラインULIDの配列
 * 
 * Output:
 *   - lines: StructRow配列
 */

import type { ActivityFunction } from '~/types/activity'
import { type StructRow, useTableStructStore } from '~/stores/tableStruct'
import alasql from 'alasql'

export interface MakeBlockACPayload {
  masterBlock: string
  tableUlid: string
  anchorUlid: string
  lineIds: string[]
}

export interface MakeBlockACResult {
  lines: StructRow[]
}

export const MakeBlockAC: ActivityFunction = async (
  payload: MakeBlockACPayload
): Promise<MakeBlockACResult> => {
  const startTime = performance.now()
  console.log('[MakeBlockAC] 実行開始:', payload)

  const tableStruct = useTableStructStore()
  const output: MakeBlockACResult = { lines: [] }

  // ライン行を取得
  const lines: StructRow[] = []
  for (const lineUlid of payload.lineIds) {
    const [line] = alasql('SELECT * FROM ? WHERE lineId = ? LIMIT 1',
      [tableStruct.rows[`node_${payload.tableUlid.toLowerCase()}`], lineUlid]) as StructRow[]
    if (line) {
      lines.push(line)
    }
  }

  output.lines = lines

  const endTime = performance.now()
  console.log(`[MakeBlockAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const MakeBlockACDef = {
  name: 'MakeBlockAC',
  scope: 'common',
  description: 'ブロックマスターとライン情報からブロックデータを構築する'
}

