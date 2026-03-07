/**
 * ResolveKeyMapAC Activity
 *
 * keyMapConfig が渡された場合はそこから直接キーを解決し、
 * 渡されなかった場合は GetLayoutKeyMapConfigAC にフォールバックする
 *
 * Input:
 *   - keyMapConfig: キーマップオブジェクト（オプション）
 *   - no: 検索キー
 *   - configId: 設定ID（keyMapConfig が無い場合のフォールバック用）
 *
 * Output:
 *   - key: 解決されたキー（見つからない場合は null）
 */

import type { ActivityFunction } from '~/types/activity'
import { GetLayoutKeyMapConfigAC } from './GetLayoutKeyMapConfigAC'

export interface ResolveKeyMapACPayload {
  keyMapConfig?: Record<string, string> | null
  no: string
  configId: string
}

export interface ResolveKeyMapACResult {
  key: string | null
}

export const ResolveKeyMapAC: ActivityFunction = async (
  payload: ResolveKeyMapACPayload
): Promise<ResolveKeyMapACResult> => {
  const startTime = performance.now()
  console.log('[ResolveKeyMapAC] 実行開始:', payload)

  let key: string | null = null

  if (payload.keyMapConfig) {
    key = payload.keyMapConfig[payload.no] ?? null
  } else {
    const output = await GetLayoutKeyMapConfigAC({
      no: payload.no,
      configId: payload.configId,
    })
    key = output.key
  }

  const result: ResolveKeyMapACResult = { key }

  const endTime = performance.now()
  console.log(`[ResolveKeyMapAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const ResolveKeyMapACDef = {
  name: 'ResolveKeyMapAC',
  scope: 'common',
  description: 'keyMapConfigまたはGetLayoutKeyMapConfigACでキーを解決する',
}
