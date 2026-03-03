
import type { ActivityFunction } from '~/types/activity'

/**
 * PaddingLayoutBlockAC の入力ペイロード
 * @interface PaddingLayoutBlockACPayload
 * @property {any[]} layoutRows - レイアウト行の配列
 */
export interface PaddingLayoutBlockACPayload {
  layoutRows: any[]
}

/**
 * PaddingLayoutBlockAC の出力結果
 * @interface PaddingLayoutBlockACResult
 * @property {any[]} layoutRows - 親階層が補完されたレイアウト行の配列
 */
export interface PaddingLayoutBlockACResult {
  layoutRows: any[]
}

/**
 * 不足している親階層のレイアウトブロックを自動的に補完します。
 * 
 * protoLeViewer などの仕組みにおいて、ドット区切りのパス（例: A.B.C）を表示するには
 * 中間パス（例: A, A.B）の定義が JSON 内に存在する必要があります。
 * この Activity は layoutRows を走査し、不足している中間階層を 'card' タイプとして補完します。
 * 
 * @param {PaddingLayoutBlockACPayload} payload
 * @returns {Promise<PaddingLayoutBlockACResult>}
 */
export const PaddingLayoutBlockAC: ActivityFunction = async (
  payload: PaddingLayoutBlockACPayload
): Promise<PaddingLayoutBlockACResult> => {
  const startTime = performance.now()
  console.log('[PaddingLayoutBlockAC] 実行開始:', payload)

  const { layoutRows } = payload
  if (!layoutRows || !Array.isArray(layoutRows)) {
    return { layoutRows: layoutRows || [] }
  }

  // 現在存在する全てのフルパスをセットとして保持
  const existingPaths = new Set<string>()
  for (const row of layoutRows) {
    for (const path of Object.keys(row)) {
      // '#' が含まれる場合はパス部分のみ抽出
      const baseWeightPath = path.split('#')[0]
      existingPaths.add(baseWeightPath)
    }
  }

  const addedRows: any[] = []
  const addedPaths = new Set<string>()

  // 各パスについて親階層を遡ってチェック
  for (const row of layoutRows) {
    for (const fullPath of Object.keys(row)) {
      const baseWeightPath = fullPath.split('#')[0]
      const segments = baseWeightPath.split('.')

      // ルート(segments.length === 1)以外の親をチェック
      // 末尾が .[0] などの場合は、その親（.[0]を除いたもの）もチェック対象に含める必要がある
      for (let i = 1; i <= segments.length; i++) {
        const currentPath = segments.slice(0, i).join('.')
        
        // 自分自身(baseWeightPath)そのものは補完対象外（既に存在するはず）
        if (currentPath === baseWeightPath) continue

        // 親階層をチェック
        const parentPath = currentPath
        
        // 既存のパスにも、今回追加したパスにも存在しない場合、補完対象とする
        if (!existingPaths.has(parentPath) && !addedPaths.has(parentPath)) {
          console.log(`[PaddingLayoutBlockAC] 不足している親パスを補完: ${parentPath}`)
          
          const newRow: Record<string, any> = {
            [parentPath]: {
              instViewType: 'card',
              instEditType: 'card',
              tplViewType: 'card',
              tplEditType: 'card',
            }
          }
          addedRows.push(newRow)
          addedPaths.add(parentPath)
        }
      }
    }
  }

  const output: PaddingLayoutBlockACResult = { layoutRows: addedRows }

  const endTime = performance.now()
  console.log(`[PaddingLayoutBlockAC] 完了 (${(endTime - startTime).toFixed(3)}ms): 追加されたパス:`, Array.from(addedPaths))
  return output
}

export const PaddingLayoutBlockACDef = {
  name: 'PaddingLayoutBlockAC',
  category: 'processing',
  description: '不足している親階層のレイアウトブロックを補完する',
}
