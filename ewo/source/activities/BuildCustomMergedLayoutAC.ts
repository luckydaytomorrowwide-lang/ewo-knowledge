/**
 * BuildCustomMergedLayoutAC Activity
 * 
 * カレンダー/WebRTC/メッセージ一覧用の汎用パススルーAC
 * layoutRowsをそのままdataとして表示層に渡す
 */

import type { ActivityFunction } from '~/types/activity'
import { BuildMergedLayoutAC } from './BuildMergedLayoutAC'
import type { MergedLayoutNode } from './BuildMergedLayoutAC'
import type { CustomViewType } from '~/types/calendar'

export interface BuildCustomMergedLayoutACPayload {
  layoutRows: any[]
  viewType: CustomViewType
  nodeType: 'instance' | 'template'
  displayMode: 'view' | 'edit'
  options?: Record<string, any>  // 表示層に渡すオプション
}

export interface BuildCustomMergedLayoutACResult {
  mergedLayoutNode: MergedLayoutNode | null
}

export const BuildCustomMergedLayoutAC: ActivityFunction = async (
  payload: BuildCustomMergedLayoutACPayload
): Promise<BuildCustomMergedLayoutACResult> => {
  const startTime = performance.now()
  console.log('[BuildCustomMergedLayoutAC] 実行開始:', payload)

  // 1. まず BuildMergedLayoutAC を使って通常のツリー構造（ボタン等を含む）を構築する
  //    ※CalendarBlockでは独自にhiddenを抽出するため、ここではボタン等を表示対象として取得する
  const buildMergedLayoutResult = await BuildMergedLayoutAC({
    layoutRows: payload.layoutRows,
    nodeType: payload.nodeType,
    displayMode: payload.displayMode
  })

  const rootMergedNode = buildMergedLayoutResult.mergedLayoutNode

  // 2. カレンダー/WebRTC/メッセージ一覧用のノードを作成し、
  //    BuildMergedLayoutAC で生成された子ノード（ボタン等）を継承する
  const mergedLayoutNode: MergedLayoutNode = {
    key: 'block[custom-root]',
    type: payload.viewType,  // 'calendar' | 'webrtc' | 'messageList'
    layoutProps: { layout: 'vertical' },
    data: {
      layoutRows: payload.layoutRows,
      nodeType: payload.nodeType,
      displayMode: payload.displayMode,
      options: payload.options || {}
    },
    // BuildMergedLayoutAC で作成された子ノードのうち、actionButton のみを表示対象とする
    children: (rootMergedNode?.children || []).filter(child => child.type === 'actionButton')
  }

  const output: BuildCustomMergedLayoutACResult = {
    mergedLayoutNode
  }

  const endTime = performance.now()
  console.log(`[BuildCustomMergedLayoutAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildCustomMergedLayoutACDef = {
  name: 'BuildCustomMergedLayoutAC',
  scope: 'common',
  description: 'カスタムビュー（カレンダー/WebRTC/メッセージ）用の汎用レイアウト生成AC'
}
