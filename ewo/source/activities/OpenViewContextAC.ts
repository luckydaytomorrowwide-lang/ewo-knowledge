/**
 * OpenViewContextAC Activity
 * 
 * ViewContext（表示領域）を開く/登録する
 * データバインディングや初期描画モードを指定可能
 */

import type { ActivityFunction } from '~/types/activity'
import type { LayoutNode, ContainerDisplayMode } from '~/types/vnode'
import { useViewContextStore } from '~/stores/viewContext'

export interface OpenViewContextACPayload {
    contextId: string
    renderMode: 'view' | 'edit'

    boundDataKey?: string
    layout?: LayoutNode
    displayMode?: ContainerDisplayMode

    parentContextId?: string
    meta?: Record<string, any>
    params?: Record<string, any>
}

export interface OpenViewContextACResult {
    success: boolean
    contextId: string
}

export const OpenViewContextAC: ActivityFunction = async (
    payload: OpenViewContextACPayload
): Promise<OpenViewContextACResult> => {
    console.log('[OpenViewContextAC]', payload)

    try {
        const store = useViewContextStore()

        store.openContext({
            contextId: payload.contextId,
            renderMode: payload.renderMode,
            boundDataKey: payload.boundDataKey,
            layout: payload.layout,
            displayMode: payload.displayMode,
            parentContextId: payload.parentContextId,
            meta: payload.meta,
            params: payload.params
        })

        return {
            success: true,
            contextId: payload.contextId
        }
    } catch (error) {
        console.error('[OpenViewContextAC] Error:', error)
        return {
            success: false,
            contextId: payload.contextId
        }
    }
}

export const OpenViewContextACDef = {
    name: 'OpenViewContextAC',
    scope: 'common',
    description: 'ViewContext（表示領域）を開く/登録する'
}
