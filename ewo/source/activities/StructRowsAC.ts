/**
 * StructRowsAC Activity
 * 
 * フラットな行配列を親子関係に基づいて階層構造に変換する
 * 
 * Input:
 *   - rows: 行配列（lineId, master, vnode, parentId）
 * 
 * Output:
 *   - master別にグループ化された階層構造
 */

import type { ActivityFunction } from '~/types/activity'

export interface StructRowsACPayload {
  rows: Array<{
    lineId: string
    master: string
    vnode: any
    parentId?: string | null
  }>
}

export interface StructRowsACResult {
  [master: string]: Array<{
    lineId: string
    vnode: any
    children: any[]
    master?: string
  }>
}

export const StructRowsAC: ActivityFunction = async (
  payload: StructRowsACPayload
): Promise<StructRowsACResult> => {
  const startTime = performance.now()
  console.log('[StructRowsAC] 実行開始:', payload)

  const output: StructRowsACResult = {}

  // lineIdでアイテムを索引化
  const itemMap = new Map<string, any>()
  payload.rows.forEach(row => {
    itemMap.set(row.lineId, {
      lineId: row.lineId,
      master: row.master,
      vnode: row.vnode,
      children: []
    })
  })

  // ルート要素を格納するためのマップ（master別）
  const rootsByMaster = new Map<string, any[]>()

  // 親子関係を構築
  payload.rows.forEach(row => {
    const item = itemMap.get(row.lineId)

    if (row.parentId && itemMap.has(row.parentId)) {
      // 親が存在する場合、親のchildrenに追加
      const parent = itemMap.get(row.parentId)
      parent.children.push(item)
    } else {
      // 親がない、またはparentIdが他の行に存在しない場合はルート
      if (!rootsByMaster.has(row.master)) {
        rootsByMaster.set(row.master, [])
      }
      rootsByMaster.get(row.master)!.push(item)
    }
  })

  // master別に出力を構築
  rootsByMaster.forEach((items, master) => {
    output[master] = items
  })

  console.log('[StructRowsAC] 完了:', {
    masters: Object.keys(output),
    rootCount: payload.rows.filter(r => !r.parentId || !itemMap.has(r.parentId)).length
  })
  const endTime = performance.now()
  console.log(`[StructRowsAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const StructRowsACDef = {
  name: 'StructRowsAC',
  scope: 'common',
  description: 'フラットな行配列を親子関係に基づいて階層構造に変換する'
}

