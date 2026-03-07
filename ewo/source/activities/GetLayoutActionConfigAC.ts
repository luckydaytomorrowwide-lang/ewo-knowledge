/**
 * GetLayoutActionConfigAC
 */

import type { ActivityFunction } from '~/types/activity'
import { NCat } from "~/constants/NCat";
import { Key } from "~/constants/Key";
import { LayoutVueType } from "../../../constants/LayoutVueType";
import { UCat } from "~/constants/UCat";
import { Label } from "~/constants/Label";

export type GetLayoutActionConfigACPayload = {
  configId?: string
}

export type ButtonConfig = {
  isRoot: boolean | null
  instViewType: string | null
  instEditType: string | null
  instSelectType: string | null
  tplViewType: string | null
  tplEditType: string | null
  tplSelectType: string | null
  anchorUcat: string | null
  lineKey: string | null
  propertyKey: string | null
  propertyValue: string | null
  tableId: string | null
  buttonNcat: string | null
  buttonRootKey: string | null
}

export type GetLayoutActionConfigACResult = {
  configs: ButtonConfig[]
}

export const GetLayoutActionConfigAC: ActivityFunction = async (
  payload: GetLayoutActionConfigACPayload
): Promise<GetLayoutActionConfigACResult> => {
  const startTime = performance.now()
  console.log('[GetLayoutActionConfigAC] 実行開始:', payload)

  const output: GetLayoutActionConfigACResult = {
    configs: []
  }

  switch (payload?.configId) {
    case 'jobseeker':
    case Label.JOBSEEKER:
      output.configs = [
        { isRoot: true, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_REPOST_BTN },
        { isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_REPOST_BTN },
        { isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_BASEINFO_BTN },
      ]
      break;
    case 'baseinfo':
    case Label.BASEINFO:
      output.configs = [
        { isRoot: true, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_REPOST_BTN },
        { isRoot: false, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: UCat.FIELD, lineKey: Key.VALUE, propertyKey: Key.VALUE, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_UPDATE_BTN },
        { isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_REPOST_BTN },
        { isRoot: false, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: UCat.FIELD, lineKey: Key.VALUE, propertyKey: Key.VALUE, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_UPDATE_BTN }
      ]
      break;
    case 'message':
    case Label.MESSAGE:
      output.configs = [
        { isRoot: false, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_SEND_BTN },
        { isRoot: false, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_FORWARD_BTN },
        { isRoot: true, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_CREATE_MESSAGE_BTN },
        { isRoot: false, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_SEND_BTN },
        { isRoot: false, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_FORWARD_BTN },
        { isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_CREATE_MESSAGE_BTN },
      ]
      break;
    case 'topic':
    case Label.TOPIC:
      output.configs = [
        { isRoot: true, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_OPEN_BTN },
        { isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_OPEN_BTN },
      ]
      break;
    case 'schedule':
    case Label.SCHEDULE:
      output.configs = [
        { isRoot: false, instViewType: null, instEditType: LayoutVueType.INPUT_TEXT, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: Key.VALUE, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_EDIT_MODE_BTN },
        { isRoot: false, instViewType: null, instEditType: LayoutVueType.INPUT_TEXT, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: Key.VALUE, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_UPDATE_BTN },
        { isRoot: true, instViewType: null, instEditType: null, instSelectType: null, tplViewType: null, tplEditType: null, tplSelectType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_CREATE_CANDIDATE_SCHEDULE_BTN },
        { isRoot: false, instViewType: null, instEditType: LayoutVueType.INPUT_TEXT, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: Key.VALUE, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_EDIT_MODE_BTN },
        { isRoot: false, instViewType: null, instEditType: LayoutVueType.INPUT_TEXT, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: Key.VALUE, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_UPDATE_BTN },
        { isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null, lineKey: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_CREATE_CANDIDATE_SCHEDULE_BTN },
      ]
      break;
    default:
      output.configs = [
        // {isRoot: true, instViewType: null, instEditType: null, tplViewType: null, tplEditType: null, anchorUcat: null,    lineKey: null,    propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_REPOST_BTN},
        // {isRoot: true, viewType: null, editType: null, propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_BULK_UPDATE_BTN},
        // {isRoot: null, instViewType: null, instEditType: null, tplViewType: null, tplEditType: LayoutVueType.TEXT_VALUE, anchorUcat: null,    lineKey: null,    propertyKey: null, propertyValue: null, tableId: 'button_structs', buttonNcat: NCat.ANCHOR, buttonRootKey: Key.ROOT_EDIT_BTN},
      ]
      break
  }


  const endTime = performance.now()
  console.log(`[GetLayoutActionConfigAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const GetLayoutActionConfigACDef = {
  name: 'GetLayoutActionConfigAC',
  scope: 'common',
  description: 'ボタンのコンフィグ内容を取得する'
}
