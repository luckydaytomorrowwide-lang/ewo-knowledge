/**
 * RenderComponentAC Activity
 * 
 * コンポーネントを描画する
 * 
 * Input:
 *   - eventId: イベントID
 *   - componentName: コンポーネント名
 *   - props: プロパティ（オプション）
 * 
 * Output:
 *   - status: 実行ステータス
 *   - componentName: コンポーネント名
 *   - eventId: イベントID
 */

import type { ActivityFunction } from '~/types/activity'
import { useJointStore } from '~/stores/joint'

export interface RenderComponentACPayload {
  eventId: string
  componentName: string
  props?: Record<string, any>
}

export interface RenderComponentACResult {
  status: 'success'
  componentName: string
  eventId: string
}

export const RenderComponentAC: ActivityFunction = async (
  payload: RenderComponentACPayload
): Promise<RenderComponentACResult> => {
  const startTime = performance.now()
  console.log('[RenderComponentAC] 実行開始:', payload)

  const jointStore = useJointStore()
  
  // JointStoreにテンプレート情報を保存
  jointStore.setData(payload.eventId, {
    templates: [
      {
        vue: payload.componentName,
        jointId: payload.eventId,
        props: payload.props || {}
      }
    ]
  })
  
  const result = {
    status: 'success' as const,
    componentName: payload.componentName,
    eventId: payload.eventId
  }
  
  const endTime = performance.now()
  console.log(`[RenderComponentAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const RenderComponentACDef = {
  name: 'RenderComponentAC',
  scope: 'common',
  description: 'コンポーネントを描画する'
}

