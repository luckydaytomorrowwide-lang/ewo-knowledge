/**
 * GetLayoutButtonConfigAC
 */

import type { ActivityFunction } from '~/types/activity'

export type GetLayoutButtonConfigACPayload = {
  configId?: string
}

export type ButtonConfig = {
  isRoot: boolean | null
  viewType: string | null
  editType: string | null
  propertyKey: string | null
  propertyValue: string | null
  buttonRootKey: string
}

export type GetLayoutButtonConfigACResult = {
  configs: ButtonConfig[]
}

export const GetLayoutButtonConfigAC: ActivityFunction = async (
  payload: GetLayoutButtonConfigACPayload
): Promise<GetLayoutButtonConfigACResult> => {
  const startTime = performance.now()
  console.log('[GetLayoutButtonConfigAC] 実行開始:', payload)

  const output: GetLayoutButtonConfigACResult = {
    configs: []
  }

  switch (payload?.configId) {
    case 'jobseeker':
      output.configs = [
        {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootBaseinfoBtn'},
      ]
      break;
    case 'message':
      output.configs = [
        {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootReplyBtn'},
        {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootForwardBtn'},
      ]
      break;
    default:
      output.configs = [
        {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootRepostBtn'},
        {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootBulkUpdateBtn'},
        // {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootBaseinfoBtn'},

        {isRoot: null, viewType: 'textValue', editType: null, propertyKey: null, propertyValue: null, buttonRootKey: 'rootEditBtn'},
      ]
      break
  }


  const endTime = performance.now()
  console.log(`[GetLayoutButtonConfigAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetLayoutButtonConfigACDef = {
  name: 'GetLayoutButtonConfigAC',
  scope: 'common',
  description: 'ボタンのコンフィグ内容を取得する'
}
