/**
 * RunJointAC Activity
 * 
 * 指定した jointId の Workflow を実行する
 * Workflow 内から別の Joint（子 Workflow）を自動起動するために使用
 * 
 * Input:
 *   - jointId: 実行する Joint の ID（Workflow 定義の ID に対応）
 *   - parentJointId: 親 Container の ID（省略可）
 *   - params: 渡すパラメータ（省略可）
 *   - async: 非同期実行フラグ（true: 待たない, false: 完了まで待つ）
 * 
 * Output:
 *   - success: 成功フラグ
 *   - instanceId: 起動した Workflow インスタンス ID
 *   - result: Workflow の実行結果（async=false の場合のみ）
 */

import type { ActivityFunction } from '~/types/activity'
import { useWorkflowStore } from '~/stores/workflow'

export interface RunJointACPayload {
    /** 実行する Joint（Workflow）の ID */
    jointId: string
    /** 親 Container の ID */
    parentJointId?: string
    /** Workflow に渡すパラメータ */
    params?: Record<string, any>
    /** 非同期実行（true: 待たない, false: 完了まで待つ） */
    async?: boolean
}

export interface RunJointACResult {
    success: boolean
    instanceId: string
    result?: any
}

/**
 * jointId から workflowId を解決する
 * 
 * マッピング例:
 *   'prefecture-list' → 'list_workflow'
 *   'prefecture-modal' → 'modal_workflow'
 *   'tab-*' → 'tab_content_workflow'
 * 
 * 将来的には設定ファイルや Store で管理する
 */
function resolveWorkflowId(jointId: string): string | null {
    const mapping: Record<string, string> = {
        'prefecture-list': 'list_workflow',
        'prefecture-modal': 'modal_workflow',
        // タブコンテンツ用
        'tab-basic-info': 'tab_content_workflow',
        'tab-skills': 'tab_content_workflow',
        'tab-career': 'tab_content_workflow',
        'tab-comment': 'tab_content_workflow',
        'tab-history': 'tab_content_workflow',
        'tab-memo': 'tab_content_workflow',
        'tab-interview': 'tab_content_workflow',
    }
    
    // 完全一致を優先
    if (mapping[jointId]) {
        return mapping[jointId]
    }
    
    // tab- で始まる場合は tab_content_workflow
    if (jointId.startsWith('tab-')) {
        return 'tab_content_workflow'
    }
    
    return null
}

export const RunJointAC: ActivityFunction = async (
    payload: RunJointACPayload
): Promise<RunJointACResult> => {
  const startTime = performance.now()
  console.log('[RunJointAC] 実行開始:', payload)

  const { jointId, parentJointId, params = {}, async: isAsync = true } = payload
    
    console.log(`[RunJointAC] Starting joint: ${jointId}`, { parentJointId, params, async: isAsync })
    
    try {
        const workflowStore = useWorkflowStore()
        
        // jointId から workflowId を解決
        const workflowId = resolveWorkflowId(jointId)
        
        if (!workflowId) {
            console.warn(`[RunJointAC] No workflow mapping found for jointId: ${jointId}`)
            return {
                success: false,
                instanceId: ''
            }
        }
        
        // Workflow インスタンスを作成
        const instanceId = workflowStore.createWorkflowInstance(workflowId, {
            jointId,
            parentJointId,
            ...params
        })
        
        console.log(`[RunJointAC] Created workflow instance: ${instanceId} for ${workflowId}`)
        
        if (isAsync) {
            // 非同期実行：待たずに返す
            workflowStore.runWorkflow(instanceId).catch(error => {
                console.error(`[RunJointAC] Async workflow error:`, error)
            })
            
            return {
                success: true,
                instanceId
            }
        } else {
            // 同期実行：完了まで待つ
            const result = await workflowStore.runWorkflow(instanceId)
            
            return {
                success: true,
                instanceId,
                result: result.context
            }
        }
    } catch (error) {
        console.error(`[RunJointAC] Error:`, error)
        return {
            success: false,
            instanceId: ''
        }
    }
}

export const RunJointACDef = {
    name: 'RunJointAC',
    scope: 'common',
    description: '指定した jointId の Workflow を実行する'
}

