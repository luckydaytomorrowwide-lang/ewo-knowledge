import type { ActivityFunction } from '~/types/activity'

export interface BuildLayoutCalendarJsonACPayload {
  ymd?: string // yyyy-mm-dd
  mode?: 'month' | 'week' | 'day'
}

export interface BuildLayoutCalendarJsonACResult {
  layoutRows: any[]
}

/**
 * 指定された日付 (ymd) と表示形式 (mode) に基づいて、
 * カレンダーの枠組みレイアウト (layoutRows) を動的に生成する Activity
 */
export const BuildLayoutCalendarJsonAC: ActivityFunction = async (
  payload: BuildLayoutCalendarJsonACPayload
): Promise<BuildLayoutCalendarJsonACResult> => {
  const startTime = performance.now()
  console.log('[BuildLayoutCalendarJsonAC] 実行開始:', payload)

  // デフォルト値の設定
  const now = new Date()
  const defaultYmd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
  const ymd = payload.ymd || defaultYmd
  const mode = payload.mode || 'week'

  const targetDate = new Date(ymd)
  const layoutRows: any[] = []

  // 1. カレンダーコンテナ
  layoutRows.push({
    "calendar-root": {
      "instViewType": "blocks/calendar/container",
      "instEditType": "blocks/calendar/container",
      "tplViewType": "blocks/calendar/container",
      "tplEditType": "blocks/calendar/container",
      "property": {}
    }
  })

  // 2. ヘッダー
  let title = ''
  if (mode === 'month') {
    title = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月`
  } else if (mode === 'week') {
    title = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月（週表示）`
  } else {
    title = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`
  }

  layoutRows.push({
    "calendar-root.calendar-header": {
      "instViewType": "blocks/calendar/header",
      "instEditType": "blocks/calendar/header",
      "tplViewType": "blocks/calendar/header",
      "tplEditType": "blocks/calendar/header",
      "property": { title }
    }
  })

  // ヘッダー内ナビゲーション
  const navButtons = [
    { key: 'nav-prev', label: '←', jointId: 'calendar:prev' },
    { key: 'nav-today', label: '今日', jointId: 'calendar:today' },
    { key: 'nav-next', label: '→', jointId: 'calendar:next' },
    { key: 'view-day', label: '日', jointId: 'calendar:view:day' },
    { key: 'view-week', label: '週', jointId: 'calendar:view:week' },
    { key: 'view-month', label: '月', jointId: 'calendar:view:month' }
  ]

  for (const btn of navButtons) {
    layoutRows.push({
      [`calendar-root.calendar-header.${btn.key}`]: {
        "instViewType": "actionButton",
        "instEditType": "actionButton",
        "tplViewType": "actionButton",
        "tplEditType": "actionButton",
        "property": {
          "buttonLabel": btn.label,
          "buttonJointId": btn.jointId
        }
      }
    })
  }

  // 3. グリッドコンテナ (月表示以外の場合に時間軸を表示)
  if (mode !== 'month') {
    layoutRows.push({
      "calendar-root.calendar-grid-container": {
        "instViewType": "blocks/calendar/gridContainer",
        "instEditType": "blocks/calendar/gridContainer",
        "tplViewType": "blocks/calendar/gridContainer",
        "tplEditType": "blocks/calendar/gridContainer",
        "property": { "slotInterval": 30 }
      }
    })

    // 時間軸
    layoutRows.push({
      "calendar-root.calendar-grid-container.time-axis": {
        "instViewType": "blocks/calendar/timeAxis",
        "instEditType": "blocks/calendar/timeAxis",
        "tplViewType": "blocks/calendar/timeAxis",
        "tplEditType": "blocks/calendar/timeAxis",
        "property": {}
      }
    })

    for (let h = 0; h <= 24; h++) {
      layoutRows.push({
        [`calendar-root.calendar-grid-container.time-axis.time-label-${h}`]: {
          "instViewType": "blocks/calendar/timeLabel",
          "instEditType": "blocks/calendar/timeLabel",
          "tplViewType": "blocks/calendar/timeLabel",
          "tplEditType": "blocks/calendar/timeLabel",
          "property": { "label": `${h}:00` }
        }
      })
    }

    // 日付カラムの生成
    const dates: Date[] = []
    if (mode === 'week') {
      // 日曜日を開始日とする
      const dayOfWeek = targetDate.getDay()
      const diff = targetDate.getDate() - dayOfWeek
      const startOfWeek = new Date(targetDate)
      startOfWeek.setDate(diff)
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek)
        d.setDate(startOfWeek.getDate() + i)
        dates.push(d)
      }
    } else {
      dates.push(new Date(ymd))
    }

    const dayLabels = ['日', '月', '火', '水', '木', '金', '土']
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`

    for (const d of dates) {
      const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      layoutRows.push({
        [`calendar-root.calendar-grid-container.day-col-${dStr}`]: {
          "instViewType": "blocks/calendar/dayColumn",
          "instEditType": "blocks/calendar/dayColumn",
          "tplViewType": "blocks/calendar/dayColumn",
          "tplEditType": "blocks/calendar/dayColumn",
          "property": {
            "label": `${d.getMonth() + 1}/${d.getDate()}(${dayLabels[d.getDay()]})`,
            "isToday": dStr === todayStr,
            "date": dStr
          }
        }
      })
    }
  } else {
    // 月表示の場合
    layoutRows.push({
      "calendar-root.calendar-month-grid": {
        "instViewType": "blocks/calendar/monthGrid",
        "instEditType": "blocks/calendar/monthGrid",
        "tplViewType": "blocks/calendar/monthGrid",
        "tplEditType": "blocks/calendar/monthGrid",
        "property": { "year": targetDate.getFullYear(), "month": targetDate.getMonth() + 1 }
      }
    })

    // 月の日付を生成
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
    
    // カレンダーの開始日（前月の端っこを含む）
    const calendarStart = new Date(startOfMonth)
    calendarStart.setDate(startOfMonth.getDate() - startOfMonth.getDay())
    
    // カレンダーの終了日（次月の端っこを含む、合計6週間分表示することが多い）
    const calendarEnd = new Date(calendarStart)
    calendarEnd.setDate(calendarStart.getDate() + 41) // 6週間 = 42日

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`

    for (let d = new Date(calendarStart); d <= calendarEnd; d.setDate(d.getDate() + 1)) {
      const dStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      const isCurrentMonth = d.getMonth() === targetDate.getMonth()
      
      layoutRows.push({
        [`calendar-root.calendar-month-grid.day-col-${dStr}`]: {
          "instViewType": "blocks/calendar/dayColumn",
          "instEditType": "blocks/calendar/dayColumn",
          "tplViewType": "blocks/calendar/dayColumn",
          "tplEditType": "blocks/calendar/dayColumn",
          "property": {
            "label": `${d.getDate()}`,
            "isToday": dStr === todayStr,
            "date": dStr,
            "isCurrentMonth": isCurrentMonth
          }
        }
      })
    }
  }

  // 4. フッター
  layoutRows.push({
    "calendar-root.calendar-footer": {
      "instViewType": "blocks/calendar/footer",
      "instEditType": "blocks/calendar/footer",
      "tplViewType": "blocks/calendar/footer",
      "tplEditType": "blocks/calendar/footer",
      "property": {}
    }
  })

  layoutRows.push({
    "calendar-root.calendar-footer.btn-confirm": {
      "instViewType": "actionButton",
      "instEditType": "actionButton",
      "tplViewType": "actionButton",
      "tplEditType": "actionButton",
      "property": {
        "buttonLabel": "決定",
        "buttonJointId": "calendar:confirm",
        "variant": "primary"
      }
    }
  })

  const output: BuildLayoutCalendarJsonACResult = { layoutRows }

  const endTime = performance.now()
  console.log(`[BuildLayoutCalendarJsonAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, output)
  return output
}

export const BuildLayoutCalendarJsonACDef = {
  name: 'BuildLayoutCalendarJsonAC',
  scope: 'common',
  description: 'ymd と mode に基づいてカレンダーの枠組みレイアウトを動的に生成する'
}
