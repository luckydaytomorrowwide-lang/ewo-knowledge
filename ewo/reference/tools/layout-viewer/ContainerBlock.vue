<template>
  <div class="calendar-container">
    <!-- Header with nav and view buttons -->
    <div class="calendar-top-nav" v-if="headerBlocks.length > 0">
      <LayoutRenderer
        v-for="child in headerBlocks"
        :key="child.key"
        :node="child"
      />
    </div>
    
    <!-- Main grid area -->
    <div class="calendar-main-content">
      <LayoutRenderer
        v-for="child in gridBlocks"
        :key="child.key"
        :node="child"
      />
    </div>

    <!-- Confirm button area moved to bottom -->
    <div class="calendar-confirm-bottom" v-if="footerBlocks.length > 0">
      <LayoutRenderer
        v-for="child in footerBlocks"
        :key="child.key"
        :node="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LayoutRenderer from '../LayoutRenderer.vue'

const props = defineProps<{
  blockId?: string
  data?: any
  children?: any[]
}>()

const headerBlocks = computed(() => {
  return (props.children || []).filter(child => child.type === 'blocks/calendar/header')
})

const gridBlocks = computed(() => {
  return (props.children || []).filter(child => 
    child.type === 'blocks/calendar/gridContainer' || 
    child.type === 'blocks/calendar/monthGrid'
  )
})

const footerBlocks = computed(() => {
  return (props.children || []).filter(child => child.type === 'blocks/calendar/footer')
})
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: white;
}

.calendar-top-nav {
  flex-shrink: 0;
}

.calendar-confirm-bottom {
  flex-shrink: 0;
}

.calendar-main-content {
  flex: 1;
  width: 100%;
  /* 縦方向のスクロールをコンテナ側で管理し、時間軸と日付列を一体でスクロールさせる */
  overflow-y: auto;
  overflow-x: hidden; /* 横スクロールを抑止してウィンドウ内に収める */
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

.calendar-bottom-title {
  flex-shrink: 0;
  padding: 12px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}
</style>
