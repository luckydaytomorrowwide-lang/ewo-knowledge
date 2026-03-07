/**
 * xlsx-to-deploy-json.ts
 *
 * Excel シートを deploy テーブル用 JSON 構造に変換するユーティリティ
 *
 * 変換フロー:
 *   1. SheetJS の sheet_to_json 出力 → parseSheetRows() → ExcelRow[]
 *   2. ExcelRow[] → convertToDeployJson() → StructLine[] (_custom ラッパー付き)
 */

import { ulid } from 'ulidx'

// ============================================================
// 型定義
// ============================================================

/** Excel シートの1行分 (ヘッダー名ベース) */
export interface ExcelRow {
  id?: string | number
  nCat: string        // anchor | line
  uCat: string        // root | config | display | section | field | feed
  lineId: string      // 人間可読ID (例: Root-Baseinfo)
  parentId?: string   // 親のlineId
  depId?: string
  key: string
  iType: string       // direct
  fType: string       // group | text | boolean | number | radio | fa-name | array | file
  value?: string | number | boolean
}

/** JSON出力の value 部分 */
export interface StructLineValue {
  id: number
  line_id: string
  n_cat: string
  u_cat: string
  parent_id: string | null
  dep_id: string | string[]
  key: string
  i_type: string
  f_type: string
  value: string | number | boolean
}

/** JSON出力の1要素 (_custom ラッパー付き) */
export interface StructLine {
  _custom: {
    type: 'reactive'
    stateTypeName: 'Reactive'
    value: StructLineValue
  }
}

// ============================================================
// 変換オプション
// ============================================================

export interface ConvertOptions {
  /** deploy版の場合 dep_id を [] にする (default: true) */
  deployMode?: boolean
  /** root に自動追加するテンプレート行 (addNode, cpyNode 等) */
  injectRootExtras?: boolean
}

const DEFAULT_OPTIONS: Required<ConvertOptions> = {
  deployMode: true,
  injectRootExtras: true,
}

// ============================================================
// root テンプレート: Excel に無いが JSON に必要な追加行
// ============================================================

const ROOT_EXTRA_KEYS = [
  { key: 'addNode', u_cat: 'config', f_type: 'boolean', value: '' },
  { key: 'cpyNode', u_cat: 'config', f_type: 'boolean', value: '' },
  { key: 'cpyBlock', u_cat: 'config', f_type: 'boolean', value: '' },
  { key: 'nodeId', u_cat: 'config', f_type: 'text', value: '' },
]

// ============================================================
// キー名正規化: Excel → JSON
// ============================================================

const KEY_RENAME_MAP: Record<string, string> = {
  placeholder: 'placeHolder',
}

function normalizeKey(key: string): string {
  return KEY_RENAME_MAP[key] ?? key
}

// ============================================================
// 値の正規化
// ============================================================

function normalizeValue(
  value: string | number | boolean | undefined | null,
  fType: string,
): string | number | boolean {
  if (value === undefined || value === null || value === 'NaN') return ''

  if (fType === 'boolean') {
    if (value === true || value === 'True' || value === 'TRUE' || value === 1) return true
    if (value === false || value === 'False' || value === 'FALSE' || value === 0) return ''
    return ''
  }

  if (fType === 'number') {
    const num = Number(value)
    return isNaN(num) ? '' : num
  }

  return String(value)
}

// ============================================================
// _custom ラッパー
// ============================================================

function wrapCustom(value: StructLineValue): StructLine {
  return {
    _custom: {
      type: 'reactive',
      stateTypeName: 'Reactive',
      value,
    },
  }
}

// ============================================================
// メイン変換: Excel 行配列 → deploy JSON (StructLine[])
// ============================================================

export function convertToDeployJson(
  rows: ExcelRow[],
  options?: ConvertOptions,
): StructLine[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // lineId → ULID マッピング生成
  const lineIdToUlid = new Map<string, string>()
  for (const row of rows) {
    if (row.lineId && !lineIdToUlid.has(row.lineId)) {
      lineIdToUlid.set(row.lineId, ulid())
    }
  }

  const result: StructLine[] = []
  let currentId = 1
  let rootLineId: string | null = null
  const rootExistingKeys = new Set<string>()

  for (const row of rows) {
    const lineUlid = lineIdToUlid.get(row.lineId) ?? ulid()

    if (row.nCat === 'anchor' && row.uCat === 'root') {
      rootLineId = row.lineId

      result.push(wrapCustom({
        id: currentId++,
        line_id: lineUlid,
        n_cat: row.nCat,
        u_cat: row.uCat,
        parent_id: null,
        dep_id: opts.deployMode ? [] : '',
        key: row.key,
        i_type: row.iType || 'direct',
        f_type: row.fType || 'group',
        value: row.value !== undefined && row.value !== null && String(row.value) !== 'NaN'
          ? normalizeValue(row.value, row.fType) : 'template',
      }))
      continue
    }

    const parentUlid = row.parentId
      ? (lineIdToUlid.get(row.parentId) ?? null)
      : null

    if (row.parentId === rootLineId) {
      rootExistingKeys.add(row.key)
    }

    result.push(wrapCustom({
      id: currentId++,
      line_id: lineUlid,
      n_cat: row.nCat,
      u_cat: row.uCat,
      parent_id: parentUlid,
      dep_id: opts.deployMode ? [] : '',
      key: normalizeKey(row.key),
      i_type: row.iType || 'direct',
      f_type: row.fType,
      value: normalizeValue(row.value, row.fType),
    }))
  }

  // root テンプレート行の追加挿入
  if (opts.injectRootExtras && rootLineId) {
    const rootUlid = lineIdToUlid.get(rootLineId)!
    const extras: StructLine[] = []

    for (const extra of ROOT_EXTRA_KEYS) {
      if (!rootExistingKeys.has(extra.key)) {
        extras.push(wrapCustom({
          id: currentId++,
          line_id: ulid(),
          n_cat: 'line',
          u_cat: extra.u_cat,
          parent_id: rootUlid,
          dep_id: opts.deployMode ? [] : '',
          key: extra.key,
          i_type: 'direct',
          f_type: extra.f_type,
          value: extra.value,
        }))
      }
    }

    const firstChildAnchorIdx = result.findIndex(
      (item, idx) => idx > 0
        && item._custom.value.n_cat === 'anchor'
        && item._custom.value.parent_id === rootUlid,
    )
    if (firstChildAnchorIdx > 0) {
      result.splice(firstChildAnchorIdx, 0, ...extras)
    } else {
      result.push(...extras)
    }

    // ID を再連番
    result.forEach((item, idx) => {
      item._custom.value.id = idx + 1
    })
  }

  return result
}

// ============================================================
// Excel パース (SheetJS の行データから ExcelRow[] へ)
// ============================================================

/**
 * SheetJS の sheet_to_json 結果を ExcelRow[] に正規化
 */
export function parseSheetRows(rawRows: Record<string, any>[]): ExcelRow[] {
  return rawRows
    .filter(row => row.nCat || row.ncat)
    .map((row) => ({
      id: row.id ?? row.ID,
      nCat: String(row.nCat ?? row.ncat ?? ''),
      uCat: String(row.uCat ?? row.ucat ?? ''),
      lineId: String(row.lineId ?? row.lineid ?? row.line_id ?? ''),
      parentId: row.parentId ?? row.parentid ?? row.parent_id ?? undefined,
      depId: row.depId ?? row.depid ?? row.dep_id ?? undefined,
      key: String(row.key ?? ''),
      iType: String(row.iType ?? row.itype ?? row.i_type ?? 'direct'),
      fType: String(row.fType ?? row.ftype ?? row.f_type ?? ''),
      value: row.value,
    }))
    .filter(row => row.nCat && row.lineId)
}
