<template>
  <div 
    class="calendar-day-column" 
    :class="{ 
      'is-today': data?.isToday,
      'is-time-grid': isTimeGrid,
      'is-month-grid': !isTimeGrid,
      'not-current-month': data?.isCurrentMonth === false
    }" 
    :data-date="data?.date"
  >
    <div class="column-label">{{ data?.label }}</div>
    <div class="event-area" @mousedown="startDrag">
      <div v-if="dragPreview" class="drag-preview" :style="dragPreviewStyle">
        <div class="event-time">{{ dragPreviewTime }}</div>
      </div>
      <LayoutRenderer
        v-for="child in children"
        :key="child.key"
        :node="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, onMounted, type ComputedRef } from 'vue'
import { EVENT_BUS_KEY } from '~/composables/useEventBus'
import LayoutRenderer from "../LayoutRenderer.vue";

const props = defineProps<{
  blockId?: string
  data?: { 
    label: string; 
    isToday: boolean; 
    date: string;
    isCurrentMonth?: boolean;
  }
  children?: any[]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any
const isTimeGrid = ref(false)
const slotInterval = inject<ComputedRef<number>>('calendar-slot-interval', computed(() => 30))
const hasTimeAxis = inject<ComputedRef<boolean>>('calendar-has-time-axis', computed(() => false))

onMounted(() => {
  // 時間軸があるかどうかの判定 (週/日表示判定)
  isTimeGrid.value = hasTimeAxis.value
})

const dragPreview = ref<{ startY: number; endY: number } | null>(null)

const dragPreviewStyle = computed(() => {
  if (!dragPreview.value) return {}
  const top = Math.min(dragPreview.value.startY, dragPreview.value.endY)
  const height = Math.abs(dragPreview.value.startY - dragPreview.value.endY)
  return {
    top: `${top}px`,
    height: `${height}px`
  }
})

const dragPreviewTime = computed(() => {
  if (!dragPreview.value) return ''
  const topY = Math.min(dragPreview.value.startY, dragPreview.value.endY)
  const bottomY = Math.max(dragPreview.value.startY, dragPreview.value.endY)
  
  // 時間軸がある場合のみ時間を計算
  if (!isTimeGrid.value) return ''

  const slotHeight = 60
  const startTotalMinutes = (topY / slotHeight) * 60
  const endTotalMinutes = (bottomY / slotHeight) * 60
  
  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
    const m = Math.floor((totalMinutes % 60) / slotInterval.value) * slotInterval.value
    return `${h}:${m.toString().padStart(2, '0')}`
  }
  
  return `${formatTime(startTotalMinutes)} - ${formatTime(endTotalMinutes)}`
})

const startDrag = (e: MouseEvent) => {
  // Prevent drag selection if clicking on an existing event or resize handle
  if ((e.target as HTMLElement).closest('.calendar-event') || (e.target as HTMLElement).closest('.resize-handle')) {
    return
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const totalHeight = rect.height
  const slotHeight = 60 // 固定値 60px/h に統一
  const subSlotHeight = slotHeight * (slotInterval.value / 60)

  const startY = Math.floor((e.clientY - rect.top) / subSlotHeight) * subSlotHeight
  dragPreview.value = { startY, endY: startY + subSlotHeight }
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    let currentY = moveEvent.clientY - rect.top
    currentY = Math.max(0, Math.min(totalHeight, currentY))
    dragPreview.value = { 
      startY, 
      endY: Math.round(currentY / subSlotHeight) * subSlotHeight 
    }
  }
  
  const handleMouseUp = (upEvent: MouseEvent) => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    
    if (!dragPreview.value) return

    const topY = Math.min(dragPreview.value.startY, dragPreview.value.endY)
    const bottomY = Math.max(dragPreview.value.startY, dragPreview.value.endY)
    
    let startTimeStr = ''
    let endTimeStr = ''
    const dateStr = props.data?.date || '2026-02-02'

    // 時間軸がある場合のみ時間を計算
    if (isTimeGrid.value) {
      const minutesFromStart = (topY / 60) * 60
      const hour = Math.floor(minutesFromStart / 60)
      const minute = Math.floor((minutesFromStart % 60) / slotInterval.value) * slotInterval.value
      
      const durationMinutes = Math.max(slotInterval.value, Math.round((bottomY - topY) / 60 * 60 / slotInterval.value) * slotInterval.value)
      
      const startTime = new Date(dateStr + 'T00:00:00')
      startTime.setHours(hour, minute, 0, 0)
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)
      
      startTimeStr = startTime.toISOString()
      endTimeStr = endTime.toISOString()
    } else {
      // 月表示等の場合は終日イベント等として扱うか、時間を空ける
      startTimeStr = dateStr
      endTimeStr = dateStr
    }
    
    dragPreview.value = null

    eventBus?.handlers.onAction?.('calendar:create', {
      actionType: 'createScheduleEvent',
      start: startTimeStr,
      end: endTimeStr,
      date: dateStr
    })
  }
  
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}
</script>

<style scoped>
.calendar-day-column {
  flex: 1;
  width: 100%;
  border-left: 1px solid #e5e7eb;
  min-width: 0; /* 50pxから0に変更し、ウィンドウ内に収まることを優先 */
}
.column-label {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.is-today .column-label {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: bold;
}
.event-area {
  position: relative;
  /* 全時間帯を確実に表示できるよう、十分な最小高さを持たせる */
  /* height: 1440px; */ /* 週/日表示のみ */
  min-height: 100px;
  flex: 1;
  cursor: crosshair;
  background-image: 
    linear-gradient(#e5e7eb 1px, transparent 1px),
    linear-gradient(rgba(229, 231, 235, 0.5) 1px, transparent 1px);
  background-size: 100% 60px, v-bind('`100% ${60 * (slotInterval / 60)}px`');
}

/* 週/日表示（時間軸がある場合）の高さ固定 */
.calendar-day-column.is-time-grid .event-area {
  height: 1440px;
}

/* 月表示内にある場合のevent-areaの背景グリッドを抑制 */
.calendar-day-column.is-month-grid .event-area {
  background-image: none;
  min-height: 120px;
}
.not-current-month {
  background-color: #f3f4f6;
  color: #9ca3af;
}
.not-current-month .column-label {
  background-color: #f3f4f6;
  opacity: 0.6;
}
.drag-preview {
  position: absolute;
  left: 2px;
  right: 2px;
  background: rgba(59, 130, 246, 0.3);
  border: 1px solid #3b82f6;
  border-radius: 4px;
  z-index: 10;
  pointer-events: none;
  padding: 4px;
  font-size: 10px;
  color: #1d4ed8;
}
</style>
