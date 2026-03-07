/**
 * GetLayoutKeyMapConfigAC
 */

import type { ActivityFunction } from '~/types/activity'

export type GetLayoutKeyMapConfigACPayload = {
  no: string

  configId: string
}

export type GetLayoutKeyMapConfigACResult = {
  key: string | null
}

export const GetLayoutKeyMapConfigAC: ActivityFunction = async (
  payload: GetLayoutKeyMapConfigACPayload
): Promise<GetLayoutKeyMapConfigACResult> => {
  const startTime = performance.now()
  console.log('[GetLayoutKeyMapConfigAC] 実行開始:', payload)

  const output: GetLayoutKeyMapConfigACResult = {key: null}

  let config:{[key: string]: string};

  switch (payload.configId) {
    case 'jobseeker':
      config = {
        N001: '01.01',
        N002: '02.01',
        N003: '02.01.01',
      }
      break
    case 'message':
      config = {
        N001: '01.01.01',
        N002: '01.02.01',
        N003: '01.02.02.01',
        N004: '01.02.03',
        N005: '01.02.04.01',
      }
      break
    case 'topic':
      config = {
        N001: '01.01.01.01',
        N002: '01.02.01.01',
        N003: '01.02.02.01',
        N004: '01.03.01.01',
        N005: '01.03.02.01'
      }
      break
    case 'schedule':
      config = {
        N001: '01',
        N002: '01',
        N003: '01'
      }
      break
    default:
      config = {
        N001: '01-01.01',
        N002: '01-02.01.01',
        N003: '01-02.01.02',
        N004: '01-02.03.01',
        N005: '01-02.03.02',
        N006: '01-02.02.01',
        N007: '01-02.02.02',
        N008: '01-02.04',
        N009: '01-02.04.01',
        N010: '01-02.04.02'
      }
  }

  output['key'] = config[payload.no]

  const endTime = performance.now()
  console.log(`[GetLayoutKeyMapConfigAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetLayoutKeyMapConfigACDef = {
  name: 'GetLayoutKeyMapConfigAC',
  scope: 'common',
  description: 'lineKeyに基づいてテンプレートタイプを検索する'
}
