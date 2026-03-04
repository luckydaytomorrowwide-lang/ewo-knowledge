/**
 * OutputVNodeAC Activity
 * 
 * マスターブロックとライン情報からVNodeを生成する
 * 
 * Input:
 *   - masterBlock: ブロックマスター名（'root', 'tab', 'section', 'field', 'button'）
 *   - lineIds: StructRow配列
 * 
 * Output:
 *   - block: VNodeオブジェクト（lineId, master, vnode, parentId）
 */

import type { ActivityFunction } from '~/types/activity'
import type { StructRow } from '~/stores/tableStruct'
import { h, defineAsyncComponent } from 'vue'

export interface OutputVNodeACPayload {
  masterBlock: string
  lineIds: StructRow[]
}

export interface OutputVNodeACResult {
  block: {
    lineId: string
    master: string
    vnode: any
    parentId?: string | null
  }
}

export const OutputVNodeAC: ActivityFunction = async (
  payload: OutputVNodeACPayload
): Promise<OutputVNodeACResult> => {
  const startTime = performance.now()
  console.log('[OutputVNodeAC] 実行開始:', payload)

  const output: any = { lines: [] }

  // ① コンポーネントマップ（エラーハンドリング付き）
  const componentMap: Record<string, any> = {
    root: defineAsyncComponent(() => import('@/components/templates/root.vue')),
    section: defineAsyncComponent(() => import('@/components/templates/section.vue')),
    field: defineAsyncComponent(() => import('@/components/templates/field.vue')),
    button: defineAsyncComponent(() => import('@/components/templates/Button.vue')),
    tab: defineAsyncComponent(() => import('@/components/templates/Tab.vue')),
  }

  const asyncComp = componentMap[payload.masterBlock]

  if (!asyncComp) {
    console.error('[OutputVNodeAC] Unknown masterBlock:', payload.masterBlock)
    throw new Error(`Unknown masterBlock: ${payload.masterBlock}`)
  }

  // ② VNode 作成
  const vnode = h(asyncComp, {
    masterBlock: payload.masterBlock,
    rows: payload.lineIds,
  })

  output.block = {
    lineId: payload.lineIds[0].lineId,
    master: payload.masterBlock,
    vnode: vnode,
    parentId: payload.lineIds[0].parentId,
  }

  const endTime = performance.now()
  console.log(`[OutputVNodeAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const OutputVNodeACDef = {
  name: 'OutputVNodeAC',
  scope: 'common',
  description: 'マスターブロックとライン情報からVNodeを生成する'
}

