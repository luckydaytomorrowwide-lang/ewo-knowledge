/**
 * GenerateModalLayoutAC Activity
 * 
 * モーダル用のLayoutNode構造を生成する
 * 
 * Input:
 *   - eventId: イベントID（jointIdとしても使用）
 *   - items: モーダル内に表示するアイテムリスト
 *   - headerText: ヘッダーテキスト（オプション）
 * 
 * Output:
 *   - layout: 生成されたLayoutNode構造
 */

import type { ActivityFunction } from '~/types/activity'
import type { LayoutNode } from '~/types/vnode'

export interface GenerateModalLayoutACPayload {
    eventId: string
    items: string[]
    headerText?: string
}

export interface GenerateModalLayoutACResult {
    layout: LayoutNode
}

export const GenerateModalLayoutAC: ActivityFunction = async (
    payload: GenerateModalLayoutACPayload
): Promise<GenerateModalLayoutACResult> => {
  const startTime = performance.now()
  console.log('[GenerateModalLayoutAC] 実行開始:', payload)

  const { eventId, items, headerText = '項目を選択' } = payload

    const layout: LayoutNode = {
        key: 'modal-root-container',
        type: 'card',
        layoutProps: {
            layout: 'vertical',
            background: 'white',
            padding: '0'
        },
        children: [
            // Header
            {
                key: `${eventId}-header-container`,
                type: 'card',
                layoutProps: { layout: 'horizontal', background: 'white', padding: '20px' },
                children: [
                    { key: `${eventId}-header`, type: 'header' }
                ]
            },
            // Body (Grid)
            {
                key: `${eventId}-grid-container`,
                type: 'card',
                layoutProps: {
                    layout: 'vertical',
                    background: 'white',
                    padding: '20px',
                    style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;'
                },
                children: items.map(item => ({
                    key: `${eventId}-item-${item}`,
                    type: 'action-button'
                }))
            },
            // Footer
            {
                key: `${eventId}-footer-container`,
                type: 'card',
                layoutProps: { layout: 'horizontal', background: '#f0f0f0', padding: '15px' },
                children: [
                    { key: `${eventId}-confirm-btn`, type: 'action-button' },
                    { key: `${eventId}-cancel-btn`, type: 'action-button' }
                ]
            }
        ]
    }

    const result = { layout }

    const endTime = performance.now()
    console.log(`[GenerateModalLayoutAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
    return result
}

export const GenerateModalLayoutACDef = {
    name: 'GenerateModalLayoutAC',
    scope: 'common',
    description: 'モーダル用のLayoutNode構造を生成する'
}
