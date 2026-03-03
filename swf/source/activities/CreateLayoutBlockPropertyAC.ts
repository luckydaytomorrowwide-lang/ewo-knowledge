/**
 * CreateLayoutBlockPropertyAC Activity
 * 
 * パラメータに値が入っているものだけで、プロパティを生成する
 * 
 * Input:
 *   - label: ラベル
 *   - jointId: ジョイントID
 *   - value: 値
 *   - (必要に応じて追加可能)
 * 
 * Output:
 *   - property: 生成されたプロパティオブジェクト
 */

import type { ActivityFunction } from '~/types/activity'

export interface CreateLayoutBlockPropertyACPayload {
  tableId: string
  lineId: string

  anchorUcat?: string
  lineKey?: string
  column?: string

  key?: string | null
  label?: string
  jointId?: string
  value?: any
  nCat?: string | null
  uCat?: string | null
  parentId?: string | null
  depId?: string | null
  iType?: string | null
  fType?: string | null

  nodeId?: string | null,
  nodeLabels?: string[] | null,
  order?: number | string | null,

  flowId?: string | null,
  containerId?: string | null,
  timestamp?: number | string | null,
  traceContainerIds?: string[] | null,
  traceFlowIds?: string[] | null,
}

export interface CreateLayoutBlockPropertyACResult {
  property: Record<string, any>
}

export const CreateLayoutBlockPropertyAC: ActivityFunction = async (
  payload: CreateLayoutBlockPropertyACPayload
): Promise<CreateLayoutBlockPropertyACResult> => {
  const startTime = performance.now()
  console.log('[CreateLayoutBlockPropertyAC] 実行開始:', payload)

  const property: Record<string, any> = {}

  Object.entries(payload).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      property[key] = val
    }
  })

  const result = { property }

  const endTime = performance.now()
  console.log(`[CreateLayoutBlockPropertyAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const CreateLayoutBlockPropertyACDef = {
  name: 'CreateLayoutBlockPropertyAC',
  scope: 'common',
  description: 'パラメータに値が入っているものだけで、プロパティを生成する',
  apiEndpoint: '/api/v1/activity'
}
