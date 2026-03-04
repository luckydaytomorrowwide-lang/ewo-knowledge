/**
 * RegisterModalDataAC Activity
 * 
 * モーダル内コンポーネントのデータをVNodeDataStoreに登録する
 * 
 * Input:
 *   - jointId: JointID（データキーのプレフィックス）
 *   - headerText: ヘッダーテキスト
 *   - items: アイテムリスト
 *   - tempSelectedValue: 現在の仮選択値（ハイライト用）
 *   - onTempSelect: 仮選択時のコールバック
 *   - onConfirm: 決定ボタンのコールバック
 *   - onCancel: キャンセルボタンのコールバック
 * 
 * Output:
 *   - success: 登録成功フラグ
 */

import type { ActivityFunction } from '~/types/activity'
import { useVNodeDataStore } from '~/stores/vnodeData'

export interface RegisterModalDataACPayload {
    jointId: string
    headerText?: string
    items: string[]
    tempSelectedValue: string
    onTempSelect: (item: string) => void
    onConfirm: () => void
    onCancel: () => void
}

export interface RegisterModalDataACResult {
    success: boolean
}

export const RegisterModalDataAC: ActivityFunction = async (
    payload: RegisterModalDataACPayload
): Promise<RegisterModalDataACResult> => {
  const startTime = performance.now()
  console.log('[RegisterModalDataAC] 実行開始:', payload)


    try {
        const store = useVNodeDataStore()
        const { jointId, headerText = '項目を選択', items, tempSelectedValue, onTempSelect, onConfirm, onCancel } = payload

        // Header
        store.setData(`${jointId}-header`, {
            header: { text: headerText, color: 'green' }
        })

        // Items (仮選択でハイライト切替)
        items.forEach(item => {
            store.setData(`${jointId}-item-${item}`, {
                button: {
                    text: item,
                    variant: tempSelectedValue === item ? 'primary' : 'outlined',
                    onClick: () => onTempSelect(item)
                }
            })
        })

        // Footer: 決定ボタン
        store.setData(`${jointId}-confirm-btn`, {
            button: {
                text: '決定',
                variant: 'primary',
                onClick: onConfirm
            }
        })

        // Footer: キャンセルボタン
        store.setData(`${jointId}-cancel-btn`, {
            button: {
                text: 'キャンセル',
                variant: 'outlined',
                onClick: onCancel
            }
        })

        console.log('[RegisterModalDataAC] 完了: Data registered for', jointId)
        return { success: true }
    } catch (error) {
        console.error('[RegisterModalDataAC] エラー:', error)
        return { success: false }
    }
}

export const RegisterModalDataACDef = {
    name: 'RegisterModalDataAC',
    scope: 'common',
    description: 'モーダル内コンポーネントのデータをVNodeDataStoreに登録する'
}
