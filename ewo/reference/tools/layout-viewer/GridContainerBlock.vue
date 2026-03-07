<script setup lang="ts">
import { computed, provide } from 'vue'
import LayoutRenderer from '../LayoutRenderer.vue'

const props = defineProps<{
  blockId?: string
  data?: {
    slotInterval?: number // 分単位 (30, 15, 60など)
  }
  children?: any[]
}>()

// スロット間隔を提供 (デフォルト30分)
const slotInterval = computed(() => props.data?.slotInterval || 30)
provide('calendar-slot-interval', slotInterval)

const timeAxisBlock = computed(() => (props.children || []).find(c => c.type === 'blocks/calendar/timeAxis'))
const hasTimeAxis = computed(() => !!timeAxisBlock.value)
provide('calendar-has-time-axis', hasTimeAxis)

const dayColumnBlocks = computed(() => (props.children || []).filter(c => c.type === 'blocks/calendar/dayColumn'))

const gridStyle = computed(() => {
  return {
    gridTemplateColumns: timeAxisBlock.value ? '60px 1fr' : '1fr'
  }
})
</script>

<template>
  <div class="calendar-grid-container" :style="gridStyle">
    <!-- 左: 時間軸（固定幅） -->
    <div class="time-axis-col" v-if="timeAxisBlock">
      <LayoutRenderer :node="timeAxisBlock" />
    </div>

    <!-- 右: 日付列（フレックスで横幅いっぱいに展開） -->
    <div class="days-col">
      <LayoutRenderer
        v-for="child in dayColumnBlocks"
        :key="child.key"
        :node="child"
      />
    </div>
  </div>
</template>

<style scoped>
.calendar-grid-container {
  display: grid;
  /* grid-template-columns: 60px 1fr; */ /* スクリプト側で動的に制御 */
  flex: 1;
  width: 100%;
  position: relative;
  border-bottom: 1px solid #e5e7eb;
}
.time-axis-col {
  overflow: hidden; /* 軽微なはみ出し抑制 */
}
.days-col {
  display: flex;
  flex: 1;
  min-width: 0;
  width: 100%;
  /* justify-content: space-between; */ /* 削除: flex-growに任せる */
}
.days-col :deep(.layout-renderer-item) {
  flex: 1;
  min-width: 0;
  display: flex;
}
</style>
