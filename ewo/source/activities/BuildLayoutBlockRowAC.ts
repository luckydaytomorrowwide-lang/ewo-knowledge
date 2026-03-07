/**
 * BuildLayoutBlockRowAC Activity
 *
 * 指定されたキー、viewType、editType、プロパティから、
 * { [key]: { viewType, editType, property } } という構造のJSON文字列を生成する
 *
 * Input:
 *   - key: ブロックキー (例: block[abcd1234].block[efgh5678])
 *   - viewType: 表示用コンポーネントタイプ (例: card, action-button)
 *   - editType: 編集用コンポーネントタイプ
 *   - property: プロパティオブジェクト
 *
 * Output:
 *   - str: 生成されたJSON文字列
 */

import type { ActivityFunction } from '~/types/activity'

export interface BuildLayoutBlockRowACPayload {
    blockKey: string
    instViewType: string
    instEditType: string
    instSelectType?: string
    tplViewType: string
    tplEditType: string
    tplSelectType?: string
    layoutProperty?: Record<string, any>
    property: Record<string, any>
}

export interface BuildLayoutBlockRowACResult {
    layoutRow: any
}

export const BuildLayoutBlockRowAC: ActivityFunction = async (
    payload: BuildLayoutBlockRowACPayload
): Promise<BuildLayoutBlockRowACResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutBlockRowAC] 実行開始:', payload)

  const { blockKey, instViewType, instEditType, instSelectType, tplViewType, tplEditType, tplSelectType, layoutProperty, property } = payload

    const row = {
        [blockKey]: {
            instViewType,
            instEditType,
            instSelectType,
            tplViewType,
            tplEditType,
            tplSelectType,
            layoutProperty,
            property
        }
    }

    // const rowStr = JSON.stringify(row)

    const output:BuildLayoutBlockRowACResult = { layoutRow: row }

    const endTime = performance.now()
    console.log(`[BuildLayoutBlockRowAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
    return output
}

export const BuildLayoutBlockRowACDef = {
    name: 'BuildLayoutBlockRowAC',
    scope: 'common',
    description: 'キー、viewType、editType、プロパティからブロック行のJSON文字列を生成する',
    apiEndpoint: '/api/v1/activity'
}
