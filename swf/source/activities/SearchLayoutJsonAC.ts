/**
 * SearchLayoutJsonAC Activity
 *
 * 指定された条件（viewType, editType, propertyのキーと値）に合致する
 * レイアウトJSON内の要素のキーを検索して返す
 *
 * Input:
 *   - json: 検索元となるレイアウトオブジェクトの配列
 *   - isRoot: 1行目のJSON（任意、現状は将来的な拡張用）
 *   - instViewType: インスタンス表示タイプ（任意）
 *   - instEditType: インスタンス編集タイプ（任意）
 *   - tplViewType: テンプレート表示タイプ（任意）
 *   - tplEditType: テンプレート編集タイプ（任意）
 *   - propertyKey: プロパティのキー名（任意）
 *   - propertyValue: プロパティの値（任意）
 *   - anchorUcat: アンカーUCAT（任意、property内の検索に使用）
 *   - lineKey: ラインキー（任意、property内の検索に使用）
 *
 * Output:
 *   - keys: 条件にヒットした要素のキー（"block[...].block[...]"など）の配列
 */

import type { ActivityFunction } from '~/types/activity'
import { JSONPath } from 'jsonpath-plus'

export interface SearchLayoutJsonACPayload {
    json: any[]
    isRoot?: any
    instViewType?: string
    instEditType?: string
    instSelectType?: string
    tplViewType?: string
    tplEditType?: string
    tplSelectType?: string
    propertyKey?: string
    propertyValue?: any
    anchorUcat?: string
    lineKey?: string
}

export interface SearchLayoutJsonACResult {
    keys: string[]
}

export const SearchLayoutJsonAC: ActivityFunction = async (
    payload: SearchLayoutJsonACPayload
): Promise<SearchLayoutJsonACResult> => {
  const startTime = performance.now()
  console.log('[SearchLayoutJsonAC] 実行開始:', payload)

  const {
      json,
      isRoot,
      instViewType,
      instEditType,
      instSelectType,
      tplViewType,
      tplEditType,
      tplSelectType,
      propertyKey,
      propertyValue,
      anchorUcat,
      lineKey
  } = payload

    if (!Array.isArray(json)) {
        console.error('[SearchLayoutJsonAC] jsonが配列ではありません')
        return { keys: []}
    }

    if (isRoot === true && json.length > 0) {
        const firstItem = json[0]
        const keys = Object.keys(firstItem)
        const result = { keys: keys.length > 0 ? [keys[0]] : [] }
        console.log('[SearchLayoutJsonAC] isRoot指定により1行目を返します:', result)
        return result
    }

    // JSONPathのクエリを構築
    // 各要素は { "key": { ... } } という形式
    // $.*[?(@.instViewType == "card" && ...)] のようなフィルタを検討するが、
    // 配列の各要素が単一のキーを持つオブジェクトなので、個別に判定するか、
    // あるいは $[?(@.*.instViewType == "card")] のように指定する。

    // フィルタ式を構築
    // JSONPath-Plusのフィルタ式内では標準のJavaScriptが使用可能だが、
    // 環境によってはグローバルオブジェクト(ObjectやJSONなど)にアクセスできない場合がある。
    // そのため、対象の構造に合わせたプロパティパスを直接指定する。
    // 各要素は { "key": { ... } } という形式なので、
    // $..*[?(@.instViewType === "card")] のように再帰的ワイルドカードを組み合わせて
    // 各項目の内部値にアクセスする。
    const matchedKeys: string[] = []
    for (const item of json) {
        const keys = Object.keys(item)
        if (keys.length === 0) continue
        const itemKey = keys[0]
        const itemValue = item[itemKey]

        let isMatch = true
        if (instViewType !== undefined && instViewType !== null) {
            if (itemValue.instViewType !== instViewType) isMatch = false
        }
        if (isMatch && instEditType !== undefined && instEditType !== null) {
            if (itemValue.instEditType !== instEditType) isMatch = false
        }
        if (isMatch && instSelectType !== undefined && instSelectType !== null) {
            if (itemValue.instSelectType !== instSelectType) isMatch = false
        }
        if (isMatch && tplViewType !== undefined && tplViewType !== null) {
            if (itemValue.tplViewType !== tplViewType) isMatch = false
        }
        if (isMatch && tplEditType !== undefined && tplEditType !== null) {
            if (itemValue.tplEditType !== tplEditType) isMatch = false
        }
        if (isMatch && tplSelectType !== undefined && tplSelectType !== null) {
            if (itemValue.tplSelectType !== tplSelectType) isMatch = false
        }

        if (isMatch) {
            const property = itemValue.property || {}

            // anchorUcat の判定
            if (anchorUcat !== undefined && anchorUcat !== null) {
                if (property.anchorUcat !== anchorUcat) isMatch = false
            }

            // lineKey の判定
            if (isMatch && lineKey !== undefined && lineKey !== null) {
                if (property.lineKey !== lineKey) isMatch = false
            }

            // propertyKey / propertyValue の判定
            if (isMatch && propertyKey !== undefined && propertyKey !== null) {
                if (propertyValue !== undefined && propertyValue !== null) {
                    if (property[propertyKey] !== propertyValue) isMatch = false
                } else {
                    if (property['key'] !== propertyKey) isMatch = false
                }
            }
        }

        if (isMatch) {
            console.log(`[SearchLayoutJsonAC] マッチしたブロック:`, item, {
                isRoot, instViewType, instEditType, instSelectType, tplViewType, tplEditType, tplSelectType,
                propertyKey, propertyValue, anchorUcat, lineKey
            })
            matchedKeys.push(itemKey)
        }
    }

    const result = { keys: matchedKeys }

    const endTime = performance.now()
    console.log(`[SearchLayoutJsonAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
    return result
}

export const SearchLayoutJsonACDef = {
    name: 'SearchLayoutJsonAC',
    scope: 'common',
    description: 'レイアウトJSONから指定条件に合致するキーを検索する',
    apiEndpoint: '/api/v1/activity'
}
