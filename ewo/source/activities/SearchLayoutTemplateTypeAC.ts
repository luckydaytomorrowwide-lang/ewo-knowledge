/**
 * SearchLayoutTemplateTypeAC
 */

import type { ActivityFunction } from '~/types/activity'
import {Key} from "~/constants/Key";
import {UCat} from "~/constants/UCat";
import {Column} from "~/constants/Column";
import alasql from "alasql";
import {LayoutVueType} from "~/constants/LayoutVueType";

export type SearchLayoutTemplateTypeACPayload = {
  lineKey: string
  column: string
  anchorUcat: string
}

export type SearchLayoutTemplateTypeACResult = {
  instViewType: string | null
  instEditType: string | null
  instSelectType: string | null
  tplViewType: string | null
  tplEditType: string | null
  tplSelectType: string | null
}

export const SearchLayoutTemplateTypeAC: ActivityFunction = async (
  payload: SearchLayoutTemplateTypeACPayload
): Promise<SearchLayoutTemplateTypeACResult> => {
  const startTime = performance.now()
  console.log('[SearchLayoutTemplateTypeAC] 実行開始:', payload)


  const types = [
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,                     column: Column.DEP_ID, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.INPUT_TEXT,   instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_TEXT,   tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,                     column: Column.I_TYPE, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.INPUT_SELECT, instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_SELECT, tplSelectType: null },

    // 特定の組み合わせ
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,                     column: Column.DEP_ID, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.INPUT_TEXT,   instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_TEXT,   tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,                     column: Column.I_TYPE, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.INPUT_SELECT, instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_SELECT, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,                     column: Column.F_TYPE, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.INPUT_SELECT, instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_SELECT, tplSelectType: null },

    // 共通設定 (anchorUcat, lineKey が null のものを共通設定とする)
    { anchorUcat: null,       lineKey: null,                          column: Column.DEP_ID, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_TEXT,   tplSelectType: null },
    { anchorUcat: null,       lineKey: null,                          column: Column.I_TYPE, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_SELECT, tplSelectType: null },
    { anchorUcat: null,       lineKey: null,                          column: Column.F_TYPE, instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.INPUT_SELECT, tplSelectType: null },

    //
    { anchorUcat: null,       lineKey: Key.BUTTON_EDIT_BTN,           column: null,          instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_EDIT_MODE_BTN,      column: null,          instViewType: LayoutVueType.ACTION_BUTTON, instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.HIDDEN,        tplEditType: LayoutVueType.HIDDEN,       tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_VIEW_MODE_BTN,      column: null,          instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.ACTION_BUTTON,instSelectType: null, tplViewType: LayoutVueType.HIDDEN,        tplEditType: LayoutVueType.HIDDEN,       tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_UPDATE_BTN,         column: null,          instViewType: LayoutVueType.ACTION_BUTTON, instEditType: LayoutVueType.ACTION_BUTTON,instSelectType: null, tplViewType: LayoutVueType.HIDDEN,        tplEditType: LayoutVueType.HIDDEN,       tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_BULK_UPDATE_BTN,    column: null,          instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.CHECKBOX,                  column: null,          instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_BULK_CANDIDATE_BTN, column: null,          instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_REPOST_BTN,         column: null,          instViewType: LayoutVueType.ACTION_BUTTON, instEditType: LayoutVueType.ACTION_BUTTON,instSelectType: null, tplViewType: LayoutVueType.HIDDEN,        tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_OPEN_BTN,           column: null,          instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_CREATE_CANDIDATE_SCHEDULE_BTN, column: null, instViewType: LayoutVueType.HIDDEN,      instEditType: LayoutVueType.HIDDEN,       instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.TEXT_LABEL,   tplSelectType: null },
    { anchorUcat: null,       lineKey: Key.BUTTON_CREATE_MESSAGE_BTN, column: null,          instViewType: LayoutVueType.ACTION_BUTTON, instEditType: LayoutVueType.ACTION_BUTTON,instSelectType: null, tplViewType: LayoutVueType.ACTION_BUTTON, tplEditType: LayoutVueType.ACTION_BUTTON,tplSelectType: null },

    // デフォルト (いずれにも当てはまらない場合)
    { anchorUcat: null,       lineKey: null,                          column: null,          instViewType: LayoutVueType.HIDDEN, instEditType: LayoutVueType.INPUT_TEXT,       instSelectType: LayoutVueType.INPUT_RADIO, tplViewType: LayoutVueType.TEXT_VALUE,    tplEditType: LayoutVueType.TEXT_VALUE,   tplSelectType: null }
  ]



  const { anchorUcat, lineKey, column } = payload

  // 1. 特定の組み合わせを検索
  let results = alasql('SELECT * FROM ? WHERE anchorUcat = ? AND lineKey = ? AND [column] = ?', [types, anchorUcat, lineKey, column])

  // 2. 見つからない場合は共通設定を検索
  if (results.length === 0) {
    results = alasql('SELECT * FROM ? WHERE anchorUcat IS NULL AND lineKey IS NULL AND [column] = ?', [types, column])
  }

  if (results.length === 0) {
    results = alasql('SELECT * FROM ? WHERE anchorUcat IS NULL AND lineKey = ? AND [column] IS NULL', [types, lineKey])
  }

  // 3. それでも見つからない場合はデフォルト
  if (results.length === 0) {
    results = alasql('SELECT * FROM ? WHERE anchorUcat IS NULL AND lineKey IS NULL AND [column] IS NULL', [types])
  }

  const res = results[0]

  const output: SearchLayoutTemplateTypeACResult = {
    instViewType: res.instViewType,
    instEditType: res.instEditType,
    instSelectType: res.instSelectType || null,
    tplViewType: res.tplViewType,
    tplEditType: res.tplEditType,
    tplSelectType: res.tplSelectType || null,
  }

  const endTime = performance.now()
  console.log(`[SearchLayoutTemplateTypeAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchLayoutTemplateTypeACDef = {
  name: 'SearchLayoutTemplateTypeAC',
  scope: 'common',
  description: 'lineKeyに基づいてテンプレートタイプを検索する'
}
