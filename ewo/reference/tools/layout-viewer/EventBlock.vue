<template>
  <div 
    class="calendar-event" 
    :class="[data?.kind, { 'is-dragging': isDragging }]" 
    :style="eventStyle"
    @mousedown="handleMouseDown"
    @click.stop="handleClick"
  >
    <div class="event-title">{{ data?.title }}</div>
    <div class="event-time">{{ data?.time }}</div>
    
    <!-- Resize handles -->
    <div class="resize-handle top" @mousedown.stop="startResize($event, 'top')">
      <div v-if="isDragging && currentAction === 'resize-top'" class="resize-tooltip">{{ previewTime }}</div>
    </div>
    <div class="resize-handle bottom" @mousedown.stop="startResize($event, 'bottom')">
      <div v-if="isDragging && currentAction === 'resize-bottom'" class="resize-tooltip">{{ previewTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, type ComputedRef } from 'vue'
import { EVENT_BUS_KEY } from '~/composables/useEventBus'

const props = defineProps<{
  blockId?: string
  data?: { 
    title: string; 
    time: string; 
    kind: string;
    date: string; // ISO date string or YYYY-MM-DD
    style?: {
      top?: string;
      height?: string;
    }
  },
  children?: any[]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any
const slotInterval = inject<ComputedRef<number>>('calendar-slot-interval', computed(() => 30))

const isDragging = ref(false)
const dragOffset = ref({ top: 0, height: 0, left: 0 })
const lastPoint = ref<{ x: number; y: number } | null>(null)
const currentAction = ref<'move' | 'resize-top' | 'resize-bottom' | null>(null)
const mouseOffsetInEvent = ref(0)

const eventStyle = computed(() => {
  if (!props.data?.style) return {}
  
  const baseTop = parseFloat(props.data.style.top || '0')
  const baseHeight = parseFloat(props.data.style.height || '0')
  
  let displayTop = baseTop
  let displayHeight = baseHeight

  if (isDragging.value) {
    const rawTop = baseTop + dragOffset.value.top
    const rawHeight = baseHeight + dragOffset.value.height
    
    // スナップ計算 (1時間 = 60px 固定)
    const slotHeight = 60
    const subSlotHeight = slotHeight * (slotInterval.value / 60)
    
    displayTop = Math.round(rawTop / subSlotHeight) * subSlotHeight
    displayHeight = Math.max(subSlotHeight, Math.round(rawHeight / subSlotHeight) * subSlotHeight)

    if (currentAction.value === 'move') {
      const picked = pickDropTarget()
      const el = document.querySelector(`[data-key="${props.blockId}"]`)
      const originalArea = el?.closest('.event-area') as HTMLElement | null
      
      if (originalArea) {
        const originalRect = originalArea.getBoundingClientRect()
        let offsetX = dragOffset.value.left
        
        if (picked) {
          const areaRect = picked.area.getBoundingClientRect()
          // 他のカラムに移動している場合、そのカラムの座標系に吸着させる
          offsetX = areaRect.left - originalRect.left
          
          // ポインタ位置からtopを再計算（スナップ付き）
          if (lastPoint.value) {
            const dropY = lastPoint.value.y - areaRect.top - mouseOffsetInEvent.value
            displayTop = Math.round(Math.max(0, Math.min(areaRect.height - baseHeight, dropY)) / subSlotHeight) * subSlotHeight
          }
        } else {
          // カラムが見つからない場合はマウスに追従（スナップはする）
          displayTop = Math.round((baseTop + dragOffset.value.top) / subSlotHeight) * subSlotHeight
        }
        
        return {
          ...props.data.style,
          top: `${displayTop}px`,
          height: `${displayHeight}px`,
          zIndex: 100,
          pointerEvents: 'none',
          transform: `translateX(${offsetX}px)`
        }
      }
    }
  }

  const style: any = {
    ...props.data.style,
    top: `${displayTop}px`,
    height: `${displayHeight}px`,
    zIndex: isDragging.value ? 100 : 1,
    pointerEvents: isDragging.value ? 'none' : 'auto'
  }

  if (isDragging.value && currentAction.value === 'move') {
    style.transform = `translateX(${dragOffset.value.left}px)`
  }

  return style
})

const previewStyle = computed(() => {
  return { display: 'none' }
})

const previewTime = computed(() => {
  const baseTop = parseFloat(props.data?.style?.top || '0')
  const baseHeight = parseFloat(props.data?.style?.height || '0')
  const slotHeight = 60
  const subSlotHeight = slotHeight * (slotInterval.value / 60)

  let snappedTop = 0
  let snappedHeight = baseHeight

  // リサイズ中の場合
  if (isDragging.value && (currentAction.value === 'resize-top' || currentAction.value === 'resize-bottom')) {
    const rawTop = baseTop + dragOffset.value.top
    const rawHeight = baseHeight + dragOffset.value.height
    snappedTop = Math.round(rawTop / subSlotHeight) * subSlotHeight
    snappedHeight = Math.max(subSlotHeight, Math.round(rawHeight / subSlotHeight) * subSlotHeight)
  } 
  // 移動中の場合
  else if (isDragging.value && currentAction.value === 'move') {
    const picked = pickDropTarget()
    if (picked) {
      const areaRect = picked.area.getBoundingClientRect()
      if (lastPoint.value) {
        const dropY = lastPoint.value.y - areaRect.top - mouseOffsetInEvent.value
        snappedTop = Math.round(Math.max(0, Math.min(areaRect.height - baseHeight, dropY)) / subSlotHeight) * subSlotHeight
      }
    } else {
      const rawTop = baseTop + dragOffset.value.top
      snappedTop = Math.round(rawTop / subSlotHeight) * subSlotHeight
    }
  }

  const calcStartMinutes = (snappedTop / slotHeight) * 60
  const calcDurationMinutes = (snappedHeight / slotHeight) * 60
  
  const format = (totalMin: number) => {
    const h = Math.floor(totalMin / 60)
    const m = Math.round(totalMin % 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }
  return `${format(calcStartMinutes)} - ${format(calcStartMinutes + calcDurationMinutes)}`
})

const handleClick = () => {
  if (isDragging.value) return
  eventBus?.handlers.onAction?.('calendar:select', {
    actionType: 'selectScheduleEvent',
    blockId: props.blockId,
    event: props.data
  })
}

let dragStartY = 0
  let dragStartX = 0

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    
    dragStartY = e.clientY
    dragStartX = e.clientX
    
    // クリック位置が要素内のどこか（上端からのオフセット）を保持
    mouseOffsetInEvent.value = e.clientY - rect.top

    isDragging.value = true
    currentAction.value = 'move'
    lastPoint.value = { x: e.clientX, y: e.clientY }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartY
      const deltaX = moveEvent.clientX - dragStartX
      dragOffset.value = { top: deltaY, height: 0, left: deltaX }
      lastPoint.value = { x: moveEvent.clientX, y: moveEvent.clientY }
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      if (!isDragging.value) return
      finalizeChange(mouseOffsetInEvent.value)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

const startResize = (e: MouseEvent, direction: 'top' | 'bottom') => {
  const startY = e.clientY
  isDragging.value = true
  currentAction.value = direction === 'top' ? 'resize-top' : 'resize-bottom'
  lastPoint.value = { x: e.clientX, y: e.clientY }

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaY = moveEvent.clientY - startY
    if (direction === 'top') {
      dragOffset.value = { top: deltaY, height: -deltaY, left: 0 }
    } else {
      dragOffset.value = { top: 0, height: deltaY, left: 0 }
    }
    lastPoint.value = { x: moveEvent.clientX, y: moveEvent.clientY }
  }

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    finalizeChange()
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

const pickDropTarget = () => {
  // ポインタ直下の日付カラムを特定
  const pt = lastPoint.value
  if (!pt) return null
  const elements = document.elementsFromPoint(pt.x, pt.y)
  console.log('[EventBlock] elements at point:', elements)
  const dayCol = elements.find(el => {
    const htmlEl = el as HTMLElement
    return htmlEl.classList?.contains('calendar-day-column') || htmlEl.closest('.calendar-day-column')
  }) as HTMLElement | undefined
  
  const targetCol = dayCol?.classList?.contains('calendar-day-column') 
    ? dayCol 
    : (dayCol?.closest('.calendar-day-column') as HTMLElement | undefined)

  if (!targetCol) {
    console.log('[EventBlock] No calendar-day-column found at point')
    return null
  }
  const area = targetCol.querySelector('.event-area') as HTMLElement | null
  if (!area) return null
  const date = targetCol.dataset.date || null
  console.log('[EventBlock] Found drop target:', { date, area })
  return { dayCol: targetCol, area, date }
}

const finalizeChange = (pointerOffsetY = 0) => {
  // 1) 移動時はポインタ位置のカラムに日付を移す
  let targetArea: HTMLElement | null = null
  let targetDate = props.data?.date || '2026-02-02'

  if (currentAction.value === 'move') {
    const picked = pickDropTarget()
    if (picked) {
      targetArea = picked.area
      targetDate = picked.date || targetDate
    }
  }

  // 2) それ以外は元の親の event-area を使う
  const baseTop = parseFloat(props.data?.style?.top || '0')
  const baseHeight = parseFloat(props.data?.style?.height || '0')

  if (!targetArea) {
    const el = document.querySelector(`[data-key="${props.blockId}"]`)
    const area = el?.closest('.event-area') as HTMLElement | null
    targetArea = area
  }

  if (!targetArea) {
    cleanupDrag()
    return
  }

  const parentRect = targetArea.getBoundingClientRect()

  // スナップ
  const slotHeight = parentRect.height / 24
  const subSlotHeight = slotHeight * (slotInterval.value / 60)
  
  // リサイズ時はドラッグオフセットを含めた新しい値を計算
  let finalTopPx = baseTop + dragOffset.value.top
  let finalHeightPx = baseHeight + dragOffset.value.height

  if (currentAction.value === 'move' && lastPoint.value) {
    const dropY = lastPoint.value.y - parentRect.top - pointerOffsetY
    finalTopPx = Math.max(0, Math.min(parentRect.height - baseHeight, dropY))
    finalHeightPx = baseHeight
  }

  // スナップ
  const snappedTop = Math.round(finalTopPx / subSlotHeight) * subSlotHeight
  // リサイズで負の高さにならないようにガード (最低1スロット分)
  const snappedHeight = Math.max(subSlotHeight, Math.round(finalHeightPx / subSlotHeight) * subSlotHeight)

  // 時刻逆算 (スナップ後のピクセル値を使用)
  const startMinutes = (snappedTop / slotHeight) * 60
  const durationMinutes = (snappedHeight / slotHeight) * 60

  // 浮動小数点の誤差を考慮して丸め処理 (slotIntervalに合わせる)
  // 0.1分単位で一度丸めてからslotIntervalで丸めることで、微小な誤差によるズレを防ぐ
  const roundedStartMinutes = Math.round(startMinutes * 10) / 10
  const roundedDurationMinutes = Math.round(durationMinutes * 10) / 10
  
  const finalStartMinutes = Math.round(roundedStartMinutes / slotInterval.value) * slotInterval.value
  const finalDurationMinutes = Math.round(roundedDurationMinutes / slotInterval.value) * slotInterval.value

  const dateStr = targetDate
  const startTime = new Date(dateStr + 'T00:00:00')
  startTime.setMinutes(finalStartMinutes)
  const endTime = new Date(startTime.getTime() + finalDurationMinutes * 60000)

  eventBus?.handlers.onAction?.('calendar:update', {
    actionType: 'updateScheduleEvent',
    blockId: props.blockId,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    date: dateStr,
    payload: {
      date: dateStr,
      start: startTime.toISOString(),
      end: endTime.toISOString()
    }
  })

  cleanupDrag()
}

const cleanupDrag = () => {
  isDragging.value = false
  dragOffset.value = { top: 0, height: 0, left: 0 }
  lastPoint.value = null
  currentAction.value = null
  mouseOffsetInEvent.value = 0
}
</script>

<style scoped>
.calendar-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 4px;
  border-left: 3px solid;
  padding: 4px 8px;
  font-size: 11px;
  overflow: hidden;
  user-select: none;
  /* transition: transform 0.1s, box-shadow 0.1s; */ /* transformの干渉を防ぐため、ドラッグ中は無効化するか削除 */
  transition: box-shadow 0.1s;
}
.is-dragging {
  opacity: 0.8;
  z-index: 100;
  cursor: grabbing !important;
}
.candidate { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }
.confirmed { background: #f3e8ff; border-color: #a855f7; color: #6b21a8; }
.busy { background: #f3f4f6; border-color: #9ca3af; color: #374151; }
.calendar-event:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  cursor: grab;
}

.resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
  z-index: 10;
}
.resize-handle.top { top: 0; }
.resize-handle.bottom { bottom: 0; }
.resize-handle:hover {
  background: rgba(0, 0, 0, 0.1);
}

.resize-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 20;
}
.resize-handle.top .resize-tooltip {
  bottom: 100%;
  margin-bottom: 4px;
}
.resize-handle.bottom .resize-tooltip {
  top: 100%;
  margin-top: 4px;
}

</style>
