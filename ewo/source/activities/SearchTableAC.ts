/**
 * SearchTableAC Activity
 * 
 * テーブルを検索する
 * 
 * Input:
 *   - tableName: テーブル名（オプション）
 *   - tableType: テーブル種別（オプション）
 *   - blockLineId: ブロックのルートlineId（オプション）
 *   - type: 予備パラメータ（未使用）
 * 
 * Output:
 *   - tableNames: テーブル名の配列
 */

import type { ActivityFunction } from '~/types/activity'
import { useRdbStore } from '~/stores/rdb'

export interface SearchTableACPayload {
    tableName?: string
    tableType?: string
    blockLineId?: string
    type?: string
}

export interface SearchTableACResult {
    tableNames: string[]
}

export const SearchTableAC: ActivityFunction = async (
    payload: SearchTableACPayload
): Promise<SearchTableACResult> => {
  const startTime = performance.now()
  console.log('[SearchTableAC] 実行開始:', payload)

    const rdbStore = useRdbStore()
    const output: SearchTableACResult = { tableNames: [] }

    const allKeys = Object.keys(rdbStore.rows)

    const { tableName, tableType, blockLineId } = payload

    // すべて未指定の場合は全キーを返す
    if (!tableName && !tableType && !blockLineId) {
        output.tableNames = allKeys
        console.log('[SearchTableAC] 完了（全テーブル）:', output)
        return output
    }

    // フィルタリングロジック
    output.tableNames = allKeys.filter(key => {
        const parts = key.split('_')
        
        // tableName 指定ありの場合
        if (tableName && parts[0] !== tableName.toLowerCase()) {
            return false
        }

        // tableType 指定ありの場合
        if (tableType) {
            // tableName がある場合は parts[1] と比較
            if (tableName) {
                if (parts[1] !== tableType.toLowerCase()) {
                    return false
                }
            } else {
                // tableName がない場合は parts[0] と比較
                if (parts[0] !== tableType.toLowerCase()) {
                    return false
                }
            }
        }

        // blockLineId 指定ありの場合
        if (blockLineId) {
            // blockLineId は常に最後に来る想定（tableName_tableType_blockLineId または tableType_blockLineId）
            if (parts[parts.length - 1] !== blockLineId.toLowerCase()) {
                return false
            }
        }

        return true
    })

    const endTime = performance.now()
    console.log(`[SearchTableAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const SearchTableACDef = {
    name: 'SearchTableAC',
    scope: 'common',
    description: 'テーブルを検索する',
    apiEndpoint: '/api/v1/activity',
}

