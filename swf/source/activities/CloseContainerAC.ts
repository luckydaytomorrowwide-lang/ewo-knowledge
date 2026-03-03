/**
 * CloseContainerAC Activity
 * 
 * Container を閉じる（JointStore のステータスを closed に変更）
 * 子 Container も連動して閉じる
 * 
 * Input:
 *   - jointId: 閉じる Container ID
 *   - emitEvent: Workflow にイベントを発火するか（CallbackState 連携用）
 *   - eventName: 発火するイベント名（デフォルト: 'containerClosed'）
 *   - eventData: イベントに付与するデータ
 * 
 * Output:
 *   - success: 成功フラグ
 *   - jointId: 閉じた Container ID
 */

import type { ActivityFunction } from '~/types/activity'
import { useJointStore } from '~/stores/joint'
import { useWorkflowStore } from '~/stores/workflow'

export interface CloseContainerACPayload {
    jointId: string
    emitEvent?: boolean
    eventName?: string
    eventData?: Record<string, any>
}

export interface CloseContainerACResult {
    success: boolean
    jointId: string
}

export const CloseContainerAC: ActivityFunction = async (
    payload: CloseContainerACPayload
): Promise<CloseContainerACResult> => {
  const startTime = performance.now()
  console.log('[CloseContainerAC] 実行開始:', payload)

    try {
        const jointStore = useJointStore()
        const workflowStore = useWorkflowStore()

        // Container の情報を取得（イベント発火用）
        const container = jointStore.getContainer(payload.jointId)
        const workflowInstanceId = container?.workflowInstanceId

        // Container を閉じる（子 Container も連動）
        jointStore.closeContainer(payload.jointId)

        // Workflow にイベントを発火（CallbackState 連携）
        if (payload.emitEvent && workflowInstanceId) {
            const eventName = payload.eventName || 'containerClosed'
            const eventData = {
                jointId: payload.jointId,
                ...payload.eventData
            }
            workflowStore.emitEvent(workflowInstanceId, eventName, eventData)
            console.log('[CloseContainerAC] Event emitted:', eventName, eventData)
        }

        console.log('[CloseContainerAC] Container closed successfully:', payload.jointId)
        return {
            success: true,
            jointId: payload.jointId
        }
    } catch (error) {
        console.error('[CloseContainerAC] Error:', error)
        return {
            success: false,
            jointId: payload.jointId
        }
    }
}

export const CloseContainerACDef = {
    name: 'CloseContainerAC',
    scope: 'common',
    description: 'Container を閉じる（JointStore のステータスを closed に変更）'
}

