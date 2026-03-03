/**
 * AddFormDataStoreByOutputJsonAC Activity
 * 
 * レイアウトマップJSONからデータを抽出し、FormDataStore に保存する
 * 
 * Input:
 *   - layoutRows: レイアウトオブジェクトの配列
 *   - containerId: コンテナID (任意)
 *   - flowId: フローID (任意)
 * 
 * Output:
 *   - count: 保存された件数
 */

import type { ActivityFunction } from '~/types/activity'
import { useFormDataStore } from '~/stores/formDataStore'
import { BuildCellRefAC } from './BuildCellRefAC'

export interface AddFormDataStoreByOutputJsonACPayload {
    layoutRows: any[]
    containerId?: string
    flowId?: string
}

export interface AddFormDataStoreByOutputJsonACResult {
    count: number
}

export const AddFormDataStoreByOutputJsonAC: ActivityFunction = async (
    payload: AddFormDataStoreByOutputJsonACPayload
): Promise<AddFormDataStoreByOutputJsonACResult> => {
    const startTime = performance.now()
    console.log('[AddFormDataStoreByOutputJsonAC] 実行開始')

    if (!Array.isArray(payload.layoutRows)) {
        console.warn('[AddFormDataStoreByOutputJsonAC] layoutRows is not an array')
        return { count: 0 }
    }

    const store = useFormDataStore()
    let count = 0

    const containerId = payload.containerId || ''
    const flowId = payload.flowId || ''

    for (const row of payload.layoutRows) {
        const layoutKey = Object.keys(row)[0]
        if (!layoutKey) continue

        const item = row[layoutKey]
        const property = item.property

        if (property && property.value !== undefined && property.value !== null) {
            // 保存対象
            const tableId = property.tableId || ''
            const lineId = property.lineId || ''
            const key = property.key || ''
            const column = property.column || ''

            const { cellRef } = await BuildCellRefAC({
                tableId,
                lineId,
                key
            })

            store.addAnswerData({
                containerId,
                flowId,
                layoutKey,
                dataSource: cellRef,
                dataTitle: column || key,
                value: property.value
            })
            count++
        }
    }

    const endTime = performance.now()
    console.log(`[AddFormDataStoreByOutputJsonAC] 完了 (${(endTime - startTime).toFixed(3)}ms) -> 保存件数: ${count}`)

    return { count }
}

export const AddFormDataStoreByOutputJsonACDef = {
    name: 'AddFormDataStoreByOutputJsonAC',
    scope: 'common',
    description: 'レイアウトマップJSONからデータを抽出して保存する',
}
