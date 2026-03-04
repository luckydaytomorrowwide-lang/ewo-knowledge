/**
 * OpenContainerAC Activity
 * 
 * Container を開く（JointStore に登録して表示状態にする）
 * 
 * Input:
 *   - jointId: Container の種別 ID
 *   - containerKey: Container の一意キー（省略時は jointId）
 *   - layout: LayoutNode 構造
 *   - displayMode: 表示モード (inline | modal | drawer | panel | section)
 *   - params: 動的パラメータ（コールバック関数等）
 *   - parentJointId: 親 Container のキー（入れ子の場合）
 *   - workflowId: 紐付けられた Workflow ID
 *   - workflowInstanceId: 実行中の Workflow Instance ID
 *   - meta: メタデータ
 * 
 * Output:
 *   - success: 成功フラグ
 *   - jointId: 種別 ID
 *   - containerKey: 一意キー
 */

import type { ActivityFunction } from '~/types/activity'
import type { LayoutNode, ContainerDisplayMode } from '~/types/vnode'
import { useJointStore } from '~/stores/joint'

export interface OpenContainerACPayload {
    jointId: string
    containerKey?: string  // 省略時は jointId を使用
    layout: LayoutNode
    displayMode: ContainerDisplayMode
    params?: Record<string, any>  // 動的パラメータ
    parentJointId?: string        // 親の containerKey
    workflowId?: string
    workflowInstanceId?: string
    meta?: Record<string, any>
}

export interface OpenContainerACResult {
    success: boolean
    jointId: string
    containerKey: string
}

export const OpenContainerAC: ActivityFunction = async (
    payload: OpenContainerACPayload
): Promise<OpenContainerACResult> => {
  const startTime = performance.now()
  console.log('[OpenContainerAC] 実行開始:', payload)

  const containerKey = payload.containerKey || payload.jointId
    
    try {
        const jointStore = useJointStore()

        jointStore.openContainer({
            jointId: payload.jointId,
            containerKey: containerKey,
            layout: payload.layout,
            displayMode: payload.displayMode,
            params: payload.params,
            parentJointId: payload.parentJointId,
            workflowId: payload.workflowId,
            workflowInstanceId: payload.workflowInstanceId,
            meta: payload.meta,
        })

        return {
            success: true,
            jointId: payload.jointId,
            containerKey: containerKey
        }
    } catch (error) {
        console.error('[OpenContainerAC] Error:', error)
        return {
            success: false,
            jointId: payload.jointId,
            containerKey: containerKey
        }
    }
}

export const OpenContainerACDef = {
    name: 'OpenContainerAC',
    scope: 'common',
    description: 'Container を開く（JointStore に登録して表示状態にする）'
}
