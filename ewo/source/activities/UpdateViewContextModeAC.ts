/**
 * UpdateViewContextModeAC Activity
 * 
 * ViewContext の描画モード（view/edit）を切り替える
 */

import type { ActivityFunction } from '~/types/activity'
import { useViewContextStore } from '~/stores/viewContext'

export interface UpdateViewContextModeACPayload {
    contextId: string
    mode: 'view' | 'edit'
}

export interface UpdateViewContextModeACResult {
    success: boolean
}

export const UpdateViewContextModeAC: ActivityFunction = async (
    payload: UpdateViewContextModeACPayload
): Promise<UpdateViewContextModeACResult> => {
    console.log('[UpdateViewContextModeAC]', payload)

    try {
        const store = useViewContextStore()

        store.updateRenderMode(payload.contextId, payload.mode)

        return {
            success: true
        }
    } catch (error) {
        console.error('[UpdateViewContextModeAC] Error:', error)
        return {
            success: false
        }
    }
}

export const UpdateViewContextModeACDef = {
    name: 'UpdateViewContextModeAC',
    scope: 'common',
    description: 'ViewContext の描画モード（view/edit）を切り替える'
}
