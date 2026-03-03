
import type { ActivityFunction } from '~/types/activity'

/**
 * アプリケーション設定におけるレイアウトキーの置換に必要なペイロード構造を表します。
 *
 * このインターフェースは、指定されたレイアウト行内でキー置換操作を実行するために
 * 必要なデータを定義するために使用されます。
 *
 * @interface ReplaceLayoutKeyACPayload
 * @property {any} layoutRow - キー置換操作が実行される対象のレイアウト行。
 * @property {number} prefixKey - 置換プロセスに関連付けるために使用されるプレフィックスキー。
 * @property {string} replaceKey - 指定されたレイアウト行内の既存のキーを置き換えるキー。
 */
export interface ReplaceLayoutKeyACPayload {
  layoutRows: any
  prefixKey: string
  replaceKey: string
}

/**
 * オートコンプリート操作におけるレイアウトキーの置換結果を表します。
 *
 * このインターフェースは、置換操作後に更新されたレイアウト行の情報を
 * 保持するための構造を定義します。
 *
 * @interface ReplaceLayoutKeyACResult
 * @property {any | null} layoutRows - キー置換後に更新されたレイアウト行、
 *                                     またはレイアウト行が利用できない場合は `null`。
 */
export interface ReplaceLayoutKeyACResult {
  layoutRows: any | null
}

/**
 * レイアウト行のキーを新しいフォーマットに非同期で置換します。
 *
 * この関数は行オブジェクトの配列を処理し、各行オブジェクトは1つ以上のキーを持つことが期待されます。
 * 各行オブジェクトのキーは新しいキーフォーマット `{prefixKey}.{replaceKey}.[index]` に置換されます。
 * 元のキーに関連付けられた値は保持され、新しいキーに割り当てられます。
 * 最後に、変更されたレイアウト行が出力として返されます。
 *
 * @param {ReplaceLayoutKeyACPayload} payload - 処理に必要なデータを含むペイロード。
 * @param {Object[]} payload.layoutRow - 処理される行オブジェクトの配列。各オブジェクトはレイアウト行を表します。
 * @param {string} payload.prefixKey - 新しいキーを構築する際に使用するプレフィックス。
 * @param {string} payload.replaceKey - 古いキーを置換する際に使用するキー。
 * @returns {Promise<ReplaceLayoutKeyACResult>} 更新されたレイアウト行を含む結果で解決されるPromise。
 */
export const ReplaceLayoutKeyAC: ActivityFunction = async (
    payload: ReplaceLayoutKeyACPayload
): Promise<ReplaceLayoutKeyACResult> => {
  const startTime = performance.now()
  console.log('[ReplaceLayoutKeyAC] 実行開始:', payload)

  const { layoutRows, prefixKey, replaceKey } = payload

  const replaced = layoutRows.map((rowObj, index) => {
    const nextRow: Record<string, any> = {}

    // 1行にキーが複数あっても全部 newKey に集約されるので、
    // 複数キーが来る可能性があるなら、ここは仕様的に注意（後述）
    for (const [key, value] of Object.entries(rowObj)) {
      const newKey = `${prefixKey}.${replaceKey}.[${index}].${key}`
      nextRow[newKey] = value
    }

    return nextRow
  })

  const output: ReplaceLayoutKeyACResult = { layoutRows: replaced }

  const endTime = performance.now()
  console.log(`[ReplaceLayoutKeyAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ReplaceLayoutKeyACDef = {
  name: 'ReplaceLayoutKeyAC',
  scope: 'common',
  description: '特定のカラムの値を取得する',
  dependencies: ['DeployAC'],
}

