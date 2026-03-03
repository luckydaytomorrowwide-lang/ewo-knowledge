import type { ActivityFunction } from '~/types/activity'

export interface ConvertScheduleToCalendarEventACPayload {
  layoutRows: any[]
}

export interface ConvertScheduleToCalendarEventACResult {
  layoutRows: any[]
}

/**
 * BuildLayoutSnackingWF で生成されたスケジュール用レイアウト JSON を
 * カレンダーイベント形式 (blocks/calendar/event) に変換する
 */
export const ConvertScheduleToCalendarEventAC: ActivityFunction = async (
  payload: ConvertScheduleToCalendarEventACPayload
): Promise<ConvertScheduleToCalendarEventACResult> => {
  const startTime = performance.now()
  console.log('[ConvertScheduleToCalendarEventAC] 実行開始:', payload)

  const { layoutRows } = payload
  if (!layoutRows || !Array.isArray(layoutRows)) {
    return { layoutRows: [] }
  }

  // ノードごとにプロパティを集計する
  // SnackingWF の ReplaceLayoutKeyAC 後は
  // block[root].block[nodeId].replaceKey.[index].originalKey のような構造になっている想定
  const nodeGroups: Record<string, any> = {}

  for (const row of layoutRows) {
    for (const [fullPath, config] of Object.entries(row)) {
      // パスから nodeId を特定する (block[nodeId] の部分を抽出)
      // 例: block[root].block[01KG85DMVVDRPG1S3F6BDVGYGN]...
      const match = fullPath.match(/block\[([^\]]+)\]/g)
      if (!match || match.length < 2) continue
      
      const nodeId = match[1].replace('block[', '').replace(']', '')
      const property = (config as any).property || {}
      const anchorUcat = property.anchorUcat

      if (!nodeGroups[nodeId]) {
        nodeGroups[nodeId] = {
          properties: {},
          nodeId: nodeId
        }
      }

      if (anchorUcat) {
        nodeGroups[nodeId].properties[anchorUcat] = property.value
      }
    }
  }

  const convertedRows: any[] = []

  for (const nodeId in nodeGroups) {
    const group = nodeGroups[nodeId]
    const props = group.properties

    // タイトル: fieldTitle
    const title = props.fieldTitle || '無題'
    
    // 種類: fieldKind (候補 -> candidate, 確定 -> confirmed 等)
    let kind = 'confirmed'
    if (props.fieldKind === '候補') {
      kind = 'candidate'
    }

    // 時間パース: fieldTimeRange (2026/1/30 10:00:00-2026/1/30 11:00:00)
    const timeRange = props.fieldTimeRange || ''
    let dateStr = '2026-02-02' // デフォルト
    let displayTime = ''
    let style = { top: '0px', height: '60px' }

    if (timeRange && timeRange.includes('-')) {
      const parts = timeRange.split('-')
      const startPart = parts[0].trim()
      const endPart = parts[1].trim()

      // 日付抽出 (YYYY/M/D) -> (YYYY-MM-DD)
      const startDateMatch = startPart.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
      if (startDateMatch) {
        dateStr = `${startDateMatch[1]}-${startDateMatch[2].padStart(2, '0')}-${startDateMatch[3].padStart(2, '0')}`
      }

      // 時間抽出 (HH:mm)
      const startTimeMatch = startPart.match(/(\d{1,2}):(\d{1,2})/)
      const endTimeMatch = endPart.match(/(\d{1,2}):(\d{1,2})/)
      
      if (startTimeMatch && endTimeMatch) {
        const startH = parseInt(startTimeMatch[1])
        const startM = parseInt(startTimeMatch[2])
        const endH = parseInt(endTimeMatch[1])
        const endM = parseInt(endTimeMatch[2])

        displayTime = `${startH}:${startM.toString().padStart(2, '0')} - ${endH}:${endM.toString().padStart(2, '0')}`

        // スタイル計算 (簡易版: 1時間=60px, 0:00基点)
        const topPx = (startH * 60) + startM
        const durationMin = (endH * 60 + endM) - (startH * 60 + startM)
        style = {
          top: `${topPx}px`,
          height: `${durationMin}px`
        }
      }
    }

    const calendarPath = `calendar-root.calendar-grid-container.day-col-${dateStr}.event-${nodeId}`
    
    convertedRows.push({
      [calendarPath]: {
        instViewType: 'blocks/calendar/event',
        instEditType: 'blocks/calendar/event',
        tplViewType: 'blocks/calendar/event',
        tplEditType: 'blocks/calendar/event',
        property: {
          title: title,
          time: displayTime,
          kind: kind,
          style: style,
          nodeId: nodeId // 元のIDを保持
        }
      }
    })
  }

  const output: ConvertScheduleToCalendarEventACResult = { layoutRows: convertedRows }

  const endTime = performance.now()
  console.log(`[ConvertScheduleToCalendarEventAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const ConvertScheduleToCalendarEventACDef = {
  name: 'ConvertScheduleToCalendarEventAC',
  scope: 'common',
  description: 'スケジュールデータをカレンダーイベント形式に変換する'
}
