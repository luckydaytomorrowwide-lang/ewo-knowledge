/**
 * BuildMergedLayoutAC Activity
 */

import type { ActivityFunction } from '~/types/activity'

/**
 * 画面上の「部品（ノード）」を表すデータの形です。
 * 1つの部品が、さらにその中に「子供」の部品を持つことで、階層構造を作ります。
 */
export interface MergedLayoutNode {
  key: string           // この部品のユニークな名前（IDのようなもの）
  type: string          // 部品の種類（card, inputField, textValue など）
  layoutProps?: Record<string, any> // 見た目の設定（縦並び、横並びなど）
  data?: Record<string, any>        // 部品が表示する中身（ラベル名、入力値など）
  children?: MergedLayoutNode[]     // この部品の中に入っている子供たち
}

/**
 * 入力されるデータの1件分の形です。
 */
interface LayoutMapEntry {
  instViewType?: string
  instEditType?: string
  instSelectType?: string
  tplViewType?: string
  tplEditType?: string
  tplSelectType?: string
  property?: Record<string, any> // プロパティ（ラベル、値など）
  layoutProperty?: Record<string, any> // レイアウトプロパティ（見た目の設定など）
}

/**
 * 入力されるデータ全体の形（配列）です。
 */
type LayoutMapDataArray = Array<Record<string, LayoutMapEntry>>

export interface BuildMergedLayoutACPayload {
  layoutRows: LayoutMapDataArray | Record<string, LayoutMapEntry>
  nodeType: 'instance' | 'template'
  displayMode: 'view' | 'edit' | 'select'
}

export interface BuildMergedLayoutACResult {
  mergedLayoutNode: MergedLayoutNode | null
}

/**
 * データを「整理・整頓」する関数です。
 */
function normalizeLayoutMapData(
  data: LayoutMapDataArray | Record<string, LayoutMapEntry>
): Record<string, LayoutMapEntry> {
  if (!Array.isArray(data)) return data

  const normalizedResult: Record<string, LayoutMapEntry> = {}
  const pathCounters: Map<string, number> = new Map()

  for (const item of data) {
    for (const [path, entry] of Object.entries(item)) {
      const currentCount = pathCounters.get(path) || 0
      pathCounters.set(path, currentCount + 1)
      
      if (currentCount === 0) {
        normalizedResult[path] = entry
      } else {
        normalizedResult[`${path}#${currentCount}`] = entry
      }
    }
  }
  return normalizedResult
}

/**
 * バラバラの「パス（住所）」から「ツリー構造（家系図）」を組み立てるメインの処理です。
 */
function buildTree(
  layoutMapData: Record<string, LayoutMapEntry>,
  nodeType: 'instance' | 'template' = 'instance',
  displayMode: 'view' | 'edit' | 'select' = 'view'
): MergedLayoutNode | null {
  const sortedKeys = Object.keys(layoutMapData).sort((a, b) => {
    const aPath = a.split('#')[0]
    const bPath = b.split('#')[0]
    
    const aSegments = aPath.split('.')
    const bSegments = bPath.split('.')
    const aDepth = aSegments.length
    const bDepth = bSegments.length
    
    if (aDepth !== bDepth) {
      return aDepth - bDepth
    }

    // 各セグメントを比較
    for (let i = 0; i < aSegments.length; i++) {
      const segA = aSegments[i]
      const segB = bSegments[i]
      
      if (segA === segB) continue

      // 数値が含まれているかチェック (例: time-label-10)
      const numA = segA.match(/\d+/)
      const numB = segB.match(/\d+/)
      
      if (numA && numB) {
        // 同じプレフィックス（数値以外）を持っているかチェック
        const prefixA = segA.replace(/\d+/, '')
        const prefixB = segB.replace(/\d+/, '')
        
        if (prefixA === prefixB) {
          return parseInt(numA[0]) - parseInt(numB[0])
        }
      }
      
      return segA.localeCompare(segB)
    }
    
    return a.localeCompare(b)
  })

  if (sortedKeys.length === 0) return null

  const nodeRegistry = new Map<string, MergedLayoutNode>()
  const hiddenKeys = new Set<string>() 
  let rootNode: MergedLayoutNode | null = null

  for (const fullKey of sortedKeys) {
    const [purePath] = fullKey.split('#')
    const segments = purePath.split('.')
    const entry = layoutMapData[fullKey]

    const parentPath = segments.length > 1 ? segments.slice(0, -1).join('.') : null
    let parentIsHidden = false
    if (parentPath) {
      if (hiddenKeys.has(parentPath)) {
        parentIsHidden = true
      } else {
        for (const hiddenKey of hiddenKeys) {
          if (hiddenKey.startsWith(parentPath + '#') || hiddenKey === parentPath) {
            parentIsHidden = true
            break
          }
        }
      }
    }

    if (parentIsHidden) {
      hiddenKeys.add(fullKey)
      continue
    }

    let viewType = entry.instViewType
    let selectType = entry.instSelectType

    if (nodeType === 'instance') {
      if (displayMode === 'view') {
        viewType = entry.instViewType || viewType
      } else if (displayMode === 'edit') {
        viewType = entry.instEditType || viewType
      } else if (displayMode === 'select') {
        viewType = entry.instSelectType || viewType
      }
    } else {
      if (displayMode === 'view') {
        viewType = entry.tplViewType || viewType
      } else if (displayMode === 'edit') {
        viewType = entry.tplEditType || viewType
      } else if (displayMode === 'select') {
        viewType = entry.tplSelectType || viewType
      }
    }

    const isHiddenBySelection = viewType === 'hidden'
    let isExplicitlyHidden = false
    if (nodeType === 'instance') {
      if (displayMode === 'view' && entry.instViewType === 'hidden') isExplicitlyHidden = true
      if (displayMode === 'edit' && entry.instEditType === 'hidden') isExplicitlyHidden = true
      if (displayMode === 'select' && entry.instSelectType === 'hidden') isExplicitlyHidden = true
    } else {
      if (displayMode === 'view' && entry.tplViewType === 'hidden') isExplicitlyHidden = true
      if (displayMode === 'edit' && entry.tplEditType === 'hidden') isExplicitlyHidden = true
      if (displayMode === 'select' && entry.tplSelectType === 'hidden') isExplicitlyHidden = true
    }

    if (isHiddenBySelection || isExplicitlyHidden) {
      hiddenKeys.add(fullKey)
      continue
    }

    // 見た目に関わる設定（layoutProperty）と中身のデータ（property）を分離
    const layoutProps = { ...entry.layoutProperty || {} }
    const dataProps = { ...entry.property || {} }

    const newNode: MergedLayoutNode = {
      key: fullKey,
      type: viewType || 'div',
      layoutProps: {
        // layoutProperty.layout があればそれを優先、なければ type に応じたデフォルト
        layout: layoutProps.layout || (viewType === 'card' ? 'vertical' : 'horizontal'),
        ...layoutProps
      },
      data: dataProps,
      children: []
    }

    if (newNode.data?.key === '**') {
      hiddenKeys.add(fullKey)
      continue
    }

    nodeRegistry.set(fullKey, newNode)

    if (segments.length === 1) {
      if (!rootNode) rootNode = newNode
      continue
    }

    let parentNode = nodeRegistry.get(parentPath!)
    
    if (!parentNode && parentPath) {
      for (const [registeredKey, node] of nodeRegistry.entries()) {
        if (registeredKey.startsWith(parentPath + '#') || registeredKey === parentPath) {
          parentNode = node
          break
        }
      }
    }
    
    if (parentNode) {
      parentNode.children = parentNode.children || []
      parentNode.children.push(newNode)

      // 子要素の追加後の並び替え
      // if (parentNode.children.length > 1) {
      //   parentNode.children.sort((a, b) => {
      //     const orderA = a.data?.order ?? 999
      //     const orderB = b.data?.order ?? 999
      //     if (orderA !== orderB) return orderA - orderB
      //     return a.key.localeCompare(b.key)
      //   })
      // }

      const parentIsCard = parentNode.type === 'card'
      if (parentIsCard && !parentNode.layoutProps?.layout) { // 明示的な指定がない場合のみ自動判定
        const hasChildCard = parentNode.children.some(child => child.type === 'card')
        const hasChildButton = parentNode.children.some(child => child.type === 'actionButton' || child.type === 'button')
        const hasChildInput = parentNode.children.some(child => child.type === 'inputField' || child.type === 'inputText' || child.type === 'inputSelect')
        const hasChildLongContent = parentNode.children.some(child => 
          child.type === 'inputTextarea' || child.type === 'calendar'
        )
        
        const isLineCat = parentNode.data?.nCat === 'line'

        if (!isLineCat && (hasChildCard || hasChildLongContent || (hasChildButton && hasChildInput))) {
          parentNode.layoutProps = { ...parentNode.layoutProps, layout: 'vertical' }
        } else {
          parentNode.layoutProps = { ...parentNode.layoutProps, layout: 'horizontal' }
        }
      }
    }
  }

  return rootNode
}

export const BuildMergedLayoutAC: ActivityFunction = async (
  payload: BuildMergedLayoutACPayload
): Promise<BuildMergedLayoutACResult> => {
  const startTime = performance.now()
  console.log('[BuildMergedLayoutAC] 実行開始:', payload)

  const normalizedData = normalizeLayoutMapData(payload.layoutRows)
  const mergedLayoutNode = buildTree(normalizedData, payload.nodeType, payload.displayMode)

  const output: BuildMergedLayoutACResult = {
    mergedLayoutNode
  }

  const endTime = performance.now()
  console.log(`[BuildMergedLayoutAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildMergedLayoutACDef = {
  name: 'BuildMergedLayoutAC',
  scope: 'common',
  description: 'レイアウト行からマージされたレイアウトツリーを構築する'
}
