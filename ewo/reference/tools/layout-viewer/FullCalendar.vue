<template>
  <div class="fullcalendar-container">
    <div ref="calendarEl" class="calendar-dom-element"></div>
  </div>

  <!-- 互換用（本来はブロック側に配置）: 常時非表示 -->
  <div v-if="false" class="confirm-button-container">
    <button class="confirm-button" @click="save">決定</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, markRaw, toRaw, nextTick } from 'vue'

const props = defineProps<{ ulid: string; events?: any[] }>()

const calendarEl = ref<HTMLElement | null>(null)
let calendarApi: any = null

/**
 * Vue のリアクティブシステムから完全に独立した関数でカレンダーを初期化する
 */
const initCalendarNative = (el: HTMLElement, CalendarClass: any, options: any) => {
  return new CalendarClass(el, options)
}

const loadCalendar = async () => {
  if (!process.client) return
  if (!calendarEl.value) return

  try {
    // Core API とプラグインをインポート
    const [
      fullcalendarCore,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      listPlugin
    ] = await Promise.all([
      import('@fullcalendar/core'),
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/interaction'),
      import('@fullcalendar/list')
    ])

    // プラグインは .default プロパティから取得し、確実に toRaw する
    const plugins = [
      toRaw(dayGridPlugin.default || dayGridPlugin),
      toRaw(timeGridPlugin.default || timeGridPlugin),
      toRaw(interactionPlugin.default || interactionPlugin),
      toRaw(listPlugin.default || listPlugin)
    ].map(p => markRaw(p))

    // イベントデータのProxyを剥がす（JSONシリアライズで確実に）
    const rawEvents = props.events ? JSON.parse(JSON.stringify(toRaw(props.events))) : []
    console.log('[FullCalendar.vue] initializing with events:', rawEvents.length)

    // カレンダーオプション（プラグインとクラスは生のまま、イベントデータのみmarkRaw）
    const options = markRaw({
      plugins: markRaw(plugins),
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      locale: 'ja',
      allDaySlot: false,
      selectable: true,
      height: '500px',
      contentHeight: '500px',
      handleWindowResize: true,
      events: markRaw(rawEvents),
    })

    // カレンダーを初期化してマウント
    // Calendar クラスは toRaw してコンストラクタを保護
    const Calendar = toRaw(fullcalendarCore.Calendar || (fullcalendarCore as any).default?.Calendar)
    if (!Calendar) {
      throw new Error('FullCalendar Calendar class not found in imported module')
    }
    console.log('[FullCalendar.vue] Creating native calendar instance...')
    calendarApi = initCalendarNative(calendarEl.value, Calendar, options)
    
    // 描画。DOMが確実に準備できていることを保証するため nextTick を挟む
    await nextTick()
    console.log('[FullCalendar.vue] Rendering calendar...')
    calendarApi.render()
    console.log('[FullCalendar.vue] Calendar rendered. Current events in API:', calendarApi.getEvents().length)

    // 強制的にリサイズと再描画を行う（表示されない問題の対策）
    setTimeout(() => {
      if (calendarApi) {
        console.log('[FullCalendar.vue] Executing delayed updateSize/render...')
        calendarApi.updateSize()
        calendarApi.render()
      }
    }, 500)

  } catch (e) {
    console.error('Failed to load FullCalendar:', e)
  }
}

onMounted(loadCalendar)

onBeforeUnmount(() => {
  if (calendarApi) {
    calendarApi.destroy()
    calendarApi = null
  }
})

watch(
  () => props.events,
  (val) => {
    console.log('[FullCalendar.vue] props.events changed, length:', val?.length)
    if (!calendarApi) return
    try {
      calendarApi.removeAllEvents()
      if (Array.isArray(val) && val.length) {
        // 更新時も Proxy を剥がして渡す
        // toRaw だけでは不十分な場合があるため、シリアライズによるディープコピーを行う
        const rawEvents = JSON.parse(JSON.stringify(toRaw(val)))
        console.log('[FullCalendar.vue] updating API with raw events:', rawEvents.length)
        calendarApi.addEventSource(markRaw(rawEvents))
      }
    } catch (e) {
      console.warn('Failed to update events on FullCalendar API:', e)
    }
  },
  { deep: true, immediate: true }
)

const getEvents = () => {
  if (!calendarApi) return Array.isArray(props.events) ? [...props.events] : []
  return calendarApi.getEvents().map((e: any) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    extendedProps: { ...(e.extendedProps || {}) }
  }))
}

const save = () => {
  console.log('[FullCalendar.vue] save()', getEvents())
}

defineExpose({ getEvents })

</script>

<style scoped>
.fullcalendar-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  padding-bottom: 20px;
  min-height: 500px;
}

.calendar-dom-element {
  min-height: 500px;
}

/* ページタイトル用のスタイル */
.calendar-title {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  text-align: center;
}

.calendar-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #343a40;
}

.loading-spinner {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.calendar-wrapper {
  min-height: 500px;
}

/* 決定ボタン用のスタイル */
.confirm-button-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.confirm-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-button:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.confirm-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.full-calendar {
  /* カレンダーのサイズを制限 */
}

/* FullCalendar カスタムスタイル */
:deep(.fc) {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

:deep(.fc-view-harness) {
  overflow: visible;
}

:deep(.fc-toolbar) {
  margin-bottom: 1rem;
  padding: 0 1rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem !important;
  font-weight: 600;
  color: #495057;
}

:deep(.fc-button-primary) {
  background-color: #007bff;
  border-color: #007bff;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

:deep(.fc-button-primary:hover),
:deep(.fc-button-primary:focus) {
  background-color: #0056b3;
  border-color: #0056b3;
}

/* timeGridWeek ボタンがアクティブな時のスタイリング */
:deep(.fc-timeGridWeek-button.fc-button-active) {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
}

:deep(.fc-event) {
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
}

/* 今日の背景色 */
:deep(.fc-day-today) {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

/* タイムスロットのスタイル */
:deep(.fc-timegrid-slot) {
  border-color: #e9ecef;
  height: 30px;
}

:deep(.fc-timegrid-slot:hover) {
  background-color: #f8f9fa;
}

/* 選択エリアのスタイル */
:deep(.fc-highlight) {
  background: rgba(40, 167, 69, 0.3) !important;
  border: 2px dashed #28a745 !important;
}

/* 時間軸のスタイル */
:deep(.fc-timegrid-slot-label) {
  font-size: 0.75rem;
  color: #6c757d;
  vertical-align: middle;
}

/* ヘッダーの曜日表示 */
:deep(.fc-col-header-cell) {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

/* コンテンツエリアの調整 */
:deep(.fc-timegrid-body) {
  min-height: 400px;
}

/* カレンダー全体の高さを確保 */
:deep(.fc) {
  min-height: 500px;
}

/* 境界線の調整 */
:deep(.fc-scrollgrid) {
  border: 1px solid #dee2e6;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }

  :deep(.fc-button-group) {
    font-size: 0.75rem;
  }

  :deep(.fc-toolbar-title) {
    font-size: 1rem !important;
    margin-bottom: 0.5rem;
  }

  :deep(.fc-timegrid-slot-label) {
    font-size: 0.675rem;
  }
}

@media (max-width: 480px) {
  :deep(.fc-button) {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  :deep(.fc-col-header-cell-cushion) {
    padding: 4px;
    font-size: 0.75rem;
  }
}
</style>