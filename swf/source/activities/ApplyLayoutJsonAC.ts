/**
 * ApplyLayoutJsonAC Activity
 * 
 * レイアウト JSON を JointStore に反映する共通アクティビティ
 * [] 記法を含むテンプレートを itemCount に応じて展開する
 * 
 * Input:
 *   - jointId: Container の種別 ID
 *   - layoutJson: レイアウト構造（LayoutNode）- [] 記法のテンプレート可
 *   - itemCount: [] を展開する件数（省略時は展開しない）
 *   - displayMode: 表示モード (inline | modal | drawer | panel | section)
 *   - containerKey: Container の一意キー（省略時は jointId）
 * 
 * Output:
 *   - success: 成功フラグ
 *   - jointId: 種別 ID
 *   - containerKey: 一意キー
 */

import type { ActivityFunction } from '~/types/activity'
import type { LayoutNode, ContainerDisplayMode } from '~/types/vnode'
import { useJointStore } from '~/stores/joint'
import { expandLayout, hasArrayNotation } from '~/utils/expandLayout'

export interface ApplyLayoutJsonACPayload {
    jointId: string
    layoutJson: LayoutNode
    itemCount?: number
    displayMode?: ContainerDisplayMode
    containerKey?: string
    parentJointId?: string
    workflowId?: string
    meta?: Record<string, any>
}

export interface ApplyLayoutJsonACResult {
    success: boolean
    jointId: string
    containerKey: string
    expanded: boolean
}

/**
 * レイアウトに [] 記法が含まれるかチェック（再帰）
 */
function layoutHasArrayNotation(node: LayoutNode): boolean {
    if (hasArrayNotation(node.key)) {
        return true
    }
    if (node.children) {
        return node.children.some(child => layoutHasArrayNotation(child))
    }
    return false
}

export const ApplyLayoutJsonAC: ActivityFunction = async (
    payload: ApplyLayoutJsonACPayload
): Promise<ApplyLayoutJsonACResult> => {
  const startTime = performance.now()
  console.log('[ApplyLayoutJsonAC] 実行開始:', payload)

  const containerKey = payload.containerKey || payload.jointId
    let expanded = false
    
    try {
        const jointStore = useJointStore()
        let finalLayout = payload.layoutJson

        // [] 記法を含む場合、itemCount に応じて展開
        if (payload.itemCount !== undefined && payload.itemCount > 0) {
            if (layoutHasArrayNotation(payload.layoutJson)) {
                finalLayout = expandLayout(payload.layoutJson, payload.itemCount)
                expanded = true
                console.log(`[ApplyLayoutJsonAC] Layout expanded: ${payload.itemCount} items`)
            }
        }

        jointStore.openContainer({
            jointId: payload.jointId,
            containerKey: containerKey,
            layout: finalLayout,
            displayMode: payload.displayMode || 'inline',
            parentJointId: payload.parentJointId,
            workflowId: payload.workflowId,
            meta: payload.meta,
        })

        return {
            success: true,
            jointId: payload.jointId,
            containerKey: containerKey,
            expanded
        }
    } catch (error) {
        console.error('[ApplyLayoutJsonAC] Error:', error)
        return {
            success: false,
            jointId: payload.jointId,
            containerKey: containerKey,
            expanded
        }
    }
}

export const ApplyLayoutJsonACDef = {
    name: 'ApplyLayoutJsonAC',
    scope: 'common',
    description: 'レイアウト JSON を JointStore に反映（[]記法の自動展開対応）'
}
