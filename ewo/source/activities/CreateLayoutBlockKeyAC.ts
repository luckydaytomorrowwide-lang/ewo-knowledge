/**
 * CreateLayoutBlockKeyAC Activity
 * 
 * ブロックのキーを作成する
 * 
 * Input:
 *   - name: プレフィックス (デフォルト: block)
 *   - key: キーとなる値
 * 
 * Output:
 *   - str: 作成されたキー (例: block[key] または name[key])
 */

import type { ActivityFunction } from '~/types/activity'

export interface CreateLayoutBlockKeyACPayload {
  name?: string
  key?: string
}

export interface CreateLayoutBlockKeyACResult {
  str: string
}

export const CreateLayoutBlockKeyAC: ActivityFunction = async (
  payload: CreateLayoutBlockKeyACPayload
): Promise<CreateLayoutBlockKeyACResult> => {
  const startTime = performance.now()
  console.log('[CreateLayoutBlockKeyAC] 実行開始:', payload)

  const name = payload.name ?? 'block'
  const str = `${name}[${payload.key}]`

  const result = { str }
  console.log('[CreateLayoutBlockKeyAC] 完了:', result)
  const endTime = performance.now()
  console.log(`[CreateLayoutBlockKeyAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateLayoutBlockKeyACDef = {
  name: 'CreateLayoutBlockKeyAC',
  scope: 'common',
  description: 'ブロックのキーを作成する',
  apiEndpoint: '/api/v1/activity'
}
