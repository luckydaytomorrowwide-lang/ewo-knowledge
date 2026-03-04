/**
 * ParseLayoutBlockKeyAC Activity
 * 
 * レイアウトの blockKey を解析して cardKey, snackingNo, anchorId に分割する
 * 
 * Input:
 *   - blockKey: string (例: block[...].block[...].block[...].block[tableId:...|lineId:...|key:...].block[...])
 * 
 * Output:
 *   - cardKey: string (snackingNo より前のブロック群をドットで繋いだもの)
 *   - snackingNo: string (最後から2番目のブロックの中身)
 *   - anchorId: string (最後のブロックの中身)
 */

import type { ActivityFunction } from '~/types/activity'

export interface ParseLayoutBlockKeyACPayload {
  blockKey: string
}

export interface ParseLayoutBlockKeyACResult {
  cardKey: string
  snackingNo: string
  anchorId: string
  anchorUcat: string
}

export const ParseLayoutBlockKeyAC: ActivityFunction = async (
  payload: ParseLayoutBlockKeyACPayload
): Promise<ParseLayoutBlockKeyACResult> => {
  const startTime = performance.now()
  console.log('[ParseLayoutBlockKeyAC] 実行開始:', payload)

  const blockKey = payload.blockKey || ''

  // 正規表現で block[...] の中身をすべて抽出する
  // block\[([^\]]*)\] を使用
  const regex = /block\[([^\]]*)\]/g
  const matches = [...blockKey.matchAll(regex)]
  const blocks = matches.map(m => m[1])

  let cardKey = ''
  let snackingNo = ''
  let anchorId = ''

  const count = blocks.length
  if (count >= 1) {
    // 最後の要素は常に anchorId
    anchorId = blocks[count - 1]

    if (count >= 2) {
      // 最後から2番目の要素は snackingNo
      snackingNo = blocks[count - 2]

      if (count >= 3) {
        // それ以前は cardKey (元の形式 block[...] を維持してドットで繋ぐ)
        const cardKeyParts = blocks.slice(0, count - 2)
        cardKey = cardKeyParts.map(b => `block[${b}]`).join('.')
      }
    }
  }

  const output: ParseLayoutBlockKeyACResult = {
    cardKey,
    snackingNo,
    anchorId,
  }

  const endTime = performance.now()
  console.log(`[ParseLayoutBlockKeyAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ParseLayoutBlockKeyACDef = {
  name: 'ParseLayoutBlockKeyAC',
  scope: 'common',
  description: 'レイアウトの blockKey を解析して cardKey, snackingNo, anchorId に分割する',
  dependencies: []
}
