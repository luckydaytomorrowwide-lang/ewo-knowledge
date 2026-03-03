/**
 * SearchLayoutTemplateTypeByValueAC
 */

import type { ActivityFunction } from '~/types/activity'
import {Key} from "~/constants/Key";
import {UCat} from "~/constants/UCat";
import {FType} from "~/constants/FType";
import alasql from "alasql";
import {LayoutVueType} from "~/constants/LayoutVueType";

export type SearchLayoutTemplateTypeByValueACPayload = {
  lineKey: string
  fTypeColumn: string
  anchorUcat: string
}

export type SearchLayoutTemplateTypeByValueACResult = {
  instViewType: string | null
  instEditType: string | null
  instSelectType: string | null
  tplViewType: string | null
  tplEditType: string | null
  tplSelectType: string | null
}

export const SearchLayoutTemplateTypeByValueAC: ActivityFunction = async (
  payload: SearchLayoutTemplateTypeByValueACPayload
): Promise<SearchLayoutTemplateTypeByValueACResult> => {
  const startTime = performance.now()
  console.log('[SearchLayoutTemplateTypeByValueAC] 実行開始:', payload)

  const types = [
    // root / firstBlockId
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.TEXTAREA, instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.NUMBER,   instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.BOOLEAN,  instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.SELECT,   instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.RADIO,    instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.CHECKBOX, instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.FIRST_BLOCK_ID, fTypeColumn: FType.FILE,     instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },

    // root / nodeId
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.TEXTAREA, instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.NUMBER,   instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.BOOLEAN,  instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.SELECT,   instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.RADIO,    instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.CHECKBOX, instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.ROOT, lineKey: Key.NODE_ID,        fTypeColumn: FType.FILE,     instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,         instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },

    // section / label
    { anchorUcat: UCat.SECTION, lineKey: Key.LABEL,       fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.HEADER,        instEditType: LayoutVueType.HEADER,         instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },
    { anchorUcat: UCat.SECTION, lineKey: Key.LABEL,       fTypeColumn: FType.TEXTAREA, instViewType: LayoutVueType.TEXT_LABEL,    instEditType: LayoutVueType.TEXT_LABEL,     instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },

    // field / label
    { anchorUcat: UCat.FIELD, lineKey: Key.LABEL,         fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.TEXT_LABEL,    instEditType: LayoutVueType.TEXT_LABEL,     instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.LABEL,         fTypeColumn: FType.TEXTAREA, instViewType: LayoutVueType.TEXT_LABEL,    instEditType: LayoutVueType.TEXT_LABEL,     instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },

    // field / value
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_TEXT,     instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.TEXTAREA, instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_TEXTAREA, instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.NUMBER,   instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_NUMBER,   instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.BOOLEAN,  instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_BOOLEAN,  instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.SELECT,   instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_SELECT,   instSelectType: LayoutVueType.INPUT_RADIO, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.RADIO,    instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_RADIO,    instSelectType: LayoutVueType.INPUT_RADIO, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.CHECKBOX, instViewType: LayoutVueType.TEXT_VALUE,    instEditType: LayoutVueType.INPUT_CHECKBOX, instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },
    { anchorUcat: UCat.FIELD, lineKey: Key.VALUE,         fTypeColumn: FType.FILE,     instViewType: LayoutVueType.AVATAR,        instEditType: LayoutVueType.INPUT_FILE,     instSelectType: LayoutVueType.INPUT_CHECKBOX, tplViewType: LayoutVueType.AVATAR,     tplEditType: LayoutVueType.HIDDEN, tplSelectType: null },

    // tab / label
    { anchorUcat: UCat.TAB,   lineKey: Key.LABEL,         fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.ACTION_TAB,    instEditType: LayoutVueType.ACTION_TAB,    instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },

    // button / label
    { anchorUcat: UCat.BUTTON, lineKey: Key.LABEL,        fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.ACTION_BUTTON, instEditType: LayoutVueType.ACTION_BUTTON, instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },

    // auto / label
    { anchorUcat: UCat.AUTO, lineKey: Key.LABEL,          fTypeColumn: FType.TEXT,     instViewType: LayoutVueType.ACTION_AUTO,   instEditType: LayoutVueType.ACTION_AUTO,   instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null },

    // default
    { anchorUcat: null,      lineKey: null,               fTypeColumn: null,           instViewType: LayoutVueType.HIDDEN,        instEditType: LayoutVueType.HIDDEN,        instSelectType: null, tplViewType: LayoutVueType.TEXT_VALUE, tplEditType: LayoutVueType.INPUT, tplSelectType: null }
  ]

  const { anchorUcat, lineKey, fTypeColumn } = payload

  // 1. 特定の組み合わせを検索
  let results = alasql('SELECT * FROM ? WHERE anchorUcat = ? AND lineKey = ? AND fTypeColumn = ?', [types, anchorUcat, lineKey, fTypeColumn])

  // 2. 見つからない場合はデフォルト
  if (results.length === 0) {
    results = alasql('SELECT * FROM ? WHERE anchorUcat IS NULL AND lineKey IS NULL AND fTypeColumn IS NULL', [types])
  }

  const res = results[0]

  const output: SearchLayoutTemplateTypeByValueACResult = {
    instViewType: res.instViewType,
    instEditType: res.instEditType,
    instSelectType: res.instSelectType || null,
    tplViewType: res.tplViewType,
    tplEditType: res.tplEditType,
    tplSelectType: res.tplSelectType || null,
  }

  const endTime = performance.now()
  console.log(`[SearchLayoutTemplateTypeByValueAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const SearchLayoutTemplateTypeByValueACDef = {
  name: 'SearchLayoutTemplateTypeByValueAC',
  scope: 'common',
  description: 'lineKeyに基づいてテンプレートタイプを検索する'
}
