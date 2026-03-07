<template>
  <div class="calendar-header">
    <div class="calendar-nav">
      <LayoutRenderer
        v-for="child in navButtons"
        :key="child.key"
        :node="child"
      />
    </div>
    <div class="header-title-container">
      <span class="header-title-visible">{{ data?.title }}</span>
    </div>
    <div class="view-selector">
      <LayoutRenderer
        v-for="child in viewButtons"
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
  data?: { title: string }
  children?: any[]
}>()

const navButtons = computed(() => {
  if (!props.children) return []
  return props.children.filter(child => {
    const jointId = child.data?.buttonJointId || child.data?.jointId
    return jointId === 'calendar:prev' ||
           jointId === 'calendar:next' ||
           jointId === 'calendar:today'
  })
})

const viewButtons = computed(() => {
  if (!props.children) return []
  return props.children.filter(child => {
    const jointId = child.data?.buttonJointId || child.data?.jointId
    return jointId?.startsWith('calendar:view')
  })
})
</script>

<style scoped>
.calendar-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  min-height: 48px;
}
.calendar-nav {
  display: flex;
  gap: 8px;
  z-index: 10;
}
.view-selector {
  display: flex;
  gap: 8px;
  z-index: 10;
}
.header-title-container {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.header-title-visible {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  pointer-events: auto;
}
.header-title {
  display: none; /* Hide original title in HeaderBlock */
}
</style>
