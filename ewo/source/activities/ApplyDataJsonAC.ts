/**
 * ApplyDataJsonAC Activity
 * 
 * データ JSON を VNodeDataStore に反映する共通アクティビティ
 * 特殊記法（$ref:, $handler:, $data:[], jointId）を自動的にバインドする
 * [] 記法を含むキーは items 配列に応じて展開する
 * 
 * 特殊記法:
 *   - $ref:xxx        : ref への双方向バインド（値の取得 + onInput で更新）
 *   - $handler:xxx    : ハンドラー関数への参照
 *   - $data:[].xxx    : 配列アイテムのプロパティ参照
 *   - $data:[]        : 配列アイテム全体
 *   - $index          : 配列インデックス
 *   - jointId         : ボタンアクション（triggerWorkflow イベント用）
 *   - enterAction     : Enter キー押下時のアクション（jointId）
 * 
 * Input:
 *   - dataJson: データ構造（Record<string, any>）
 *   - bindContext: バインディングコンテキスト（refs, handlers）
 *   - items: 配列データ（[] 記法展開用）
 * 
 * Output:
 *   - success: 成功フラグ
 *   - appliedKeys: 適用されたキーの配列
 *   - expandedCount: 展開された配列アイテム数
 */

import type { ActivityFunction } from '~/types/activity'
import { useVNodeDataStore } from '~/stores/vnodeData'
import type { Ref } from 'vue'
import { hasArrayNotation, replaceArrayIndex, resolveDataRef } from '~/utils/expandLayout'

export interface BindContext {
    /** ref への参照マップ */
    refs?: Record<string, Ref<any>>
    /** ハンドラー関数マップ */
    handlers?: Record<string, (...args: any[]) => any>
}

export interface ApplyDataJsonACPayload {
    dataJson: Record<string, any>
    bindContext?: BindContext
    /** 配列データ（[] 記法展開用） */
    items?: Array<Record<string, any>>
}

export interface ApplyDataJsonACResult {
    success: boolean
    appliedKeys: string[]
    expandedCount: number
}

/**
 * 特殊記法を解決する（$ref, $handler のみ）
 */
function resolveBindings(
    obj: any,
    ctx: BindContext,
    parentKey?: string,
    parentObj?: any
): any {
    // null/undefined はそのまま
    if (obj === null || obj === undefined) {
        return obj
    }

    // 文字列の場合: $ref: または $handler: を解決
    if (typeof obj === 'string') {
        // $ref:xxx → ref の現在値を取得
        if (obj.startsWith('$ref:')) {
            const refName = obj.slice(5)
            const ref = ctx.refs?.[refName]
            if (ref) {
                return ref.value
            }
            console.warn(`[ApplyDataJsonAC] ref not found: ${refName}`)
            return obj
        }
        
        // $handler:xxx → ハンドラー関数を取得
        if (obj.startsWith('$handler:')) {
            const handlerName = obj.slice(9)
            const handler = ctx.handlers?.[handlerName]
            if (handler) {
                return handler
            }
            console.warn(`[ApplyDataJsonAC] handler not found: ${handlerName}`)
            return undefined
        }
        
        return obj
    }

    // 配列の場合: 各要素を再帰的に解決
    if (Array.isArray(obj)) {
        return obj.map((item, index) => resolveBindings(item, ctx, String(index), obj))
    }

    // オブジェクトの場合: 各プロパティを再帰的に解決
    if (typeof obj === 'object') {
        const resolved: Record<string, any> = {}

        for (const [key, value] of Object.entries(obj)) {
            resolved[key] = resolveBindings(value, ctx, key, obj)
        }

        // inputField の特殊処理: value が $ref の場合、onInput を自動生成
        if (parentKey === 'inputField' || obj.inputField) {
            const inputField = parentKey === 'inputField' ? resolved : resolved.inputField
            if (inputField) {
                const originalValue = parentKey === 'inputField' 
                    ? parentObj?.value 
                    : obj.inputField?.value
                const originalOnInput = parentKey === 'inputField'
                    ? parentObj?.onInput
                    : obj.inputField?.onInput
                
                if (typeof originalValue === 'string' && originalValue.startsWith('$ref:')) {
                    const refName = originalValue.slice(5)
                    const ref = ctx.refs?.[refName]
                    if (ref) {
                        if (!inputField.onInput) {
                            inputField.onInput = (e: Event) => {
                                const target = e.target as HTMLInputElement
                                ref.value = target.value
                            }
                        }
                        
                        if (inputField.enterAction && !inputField.onKeyup) {
                            inputField.onKeyup = (e: KeyboardEvent) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement
                                    const handler = ctx.handlers?.['onSearch']
                                    if (handler) {
                                        handler(target.value)
                                    }
                                }
                            }
                            delete inputField.enterAction
                        }
                    }
                } else if (typeof originalOnInput === 'string' && originalOnInput.startsWith('$handler:')) {
                    // onInput が $handler の場合、context を渡す
                    const handlerName = originalOnInput.slice(9)
                    const handler = ctx.handlers?.[handlerName]
                    const context = obj.inputField?.context
                    
                    if (handler && context) {
                        inputField.onInput = (e: Event) => handler(e, context.id)
                    }
                    delete inputField.context
                }
            }
        }

        // checkbox の特殊処理: onChange が $handler の場合、context を渡す
        if (resolved.checkbox) {
            const checkbox = resolved.checkbox
            const originalOnChange = obj.checkbox?.onChange
            
            if (typeof originalOnChange === 'string' && originalOnChange.startsWith('$handler:')) {
                const handlerName = originalOnChange.slice(9)
                const handler = ctx.handlers?.[handlerName]
                const context = obj.checkbox?.context
                
                if (handler && context) {
                    checkbox.onChange = () => handler(context.id)
                }
                delete checkbox.context
            }
        }

        return resolved
    }

    // その他の型（number, boolean など）はそのまま
    return obj
}

/**
 * $data:[] 記法を解決してバインディングも適用
 */
function resolveDataAndBindings(
    obj: any,
    item: Record<string, any>,
    index: number,
    ctx: BindContext
): any {
    // まず $data:[] を解決
    const dataResolved = resolveDataRef(obj, item, index)
    // 次に $ref, $handler を解決
    return resolveBindings(dataResolved, ctx)
}

export const ApplyDataJsonAC: ActivityFunction = async (
    payload: ApplyDataJsonACPayload
): Promise<ApplyDataJsonACResult> => {
  const startTime = performance.now()
  console.log('[ApplyDataJsonAC] 実行開始:', payload)

  const { dataJson, bindContext = {}, items = [] } = payload
    const store = useVNodeDataStore()
    const appliedKeys: string[] = []
    let expandedCount = 0

    try {
        for (const [key, value] of Object.entries(dataJson)) {
            if (hasArrayNotation(key)) {
                // [] を含むキー → items 分展開
                items.forEach((item, index) => {
                    const expandedKey = replaceArrayIndex(key, index)
                    
                    // selected フラグを追加（selectedIds との連携用）
                    const enhancedItem = {
                        ...item,
                        selected: bindContext.refs?.['selectedIds']?.value?.includes(item.id) ?? false
                    }
                    
                    const resolved = resolveDataAndBindings(value, enhancedItem, index, bindContext)
                    store.setData(expandedKey, resolved)
                    appliedKeys.push(expandedKey)
                })
                expandedCount += items.length
            } else {
                // 通常のキー
                const resolved = resolveBindings(value, bindContext)
                store.setData(key, resolved)
                appliedKeys.push(key)
            }
        }

        console.log(`[ApplyDataJsonAC] Applied ${appliedKeys.length} keys (${expandedCount} expanded)`)

        return {
            success: true,
            appliedKeys,
            expandedCount
        }
    } catch (error) {
        console.error('[ApplyDataJsonAC] Error:', error)
        return {
            success: false,
            appliedKeys,
            expandedCount
        }
    }
}

export const ApplyDataJsonACDef = {
    name: 'ApplyDataJsonAC',
    scope: 'common',
    description: 'データ JSON を VNodeDataStore に反映（自動バインド・[]記法展開対応）'
}
