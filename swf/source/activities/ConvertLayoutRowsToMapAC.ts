/**
 * ConvertLayoutRowsToMapAC
 * 
 * LayoutRows (Array) を Map (Object) 形式に変換する
 */

import type { ActivityFunction } from '~/types/activity'

export interface ConvertLayoutRowsToMapACPayload {
    layoutRows: any[]
}

export interface ConvertLayoutRowsToMapACResult {
    layoutMapData: Record<string, any>
}

export const ConvertLayoutRowsToMapAC: ActivityFunction = async (
    payload: ConvertLayoutRowsToMapACPayload
): Promise<ConvertLayoutRowsToMapACResult> => {
    const startTime = performance.now()
    console.log('[ConvertLayoutRowsToMapAC] 変換開始:', payload.layoutRows.length, '件')

    const mapData: Record<string, any> = {}

    for (const row of payload.layoutRows) {
        // layoutRows can be an array of objects where each object key is a blockKey
        const entries = Object.entries(row)
        for (const [blockKey, blockData] of entries) {
            mapData[blockKey] = blockData
        }
    }

    const endTime = performance.now()
    console.log(`[ConvertLayoutRowsToMapAC] 変換完了 (${(endTime - startTime).toFixed(3)}ms):`, Object.keys(mapData).length, 'ブロック')

    return { layoutMapData: mapData }
}

export const ConvertLayoutRowsToMapACDef = {
    name: 'ConvertLayoutRowsToMapAC',
    scope: 'common',
    description: 'LayoutRowsをMap形式に変換する',
}
