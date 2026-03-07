<template>
  <div class="time-label" v-if="data?.label !== '24:00'">
    <div class="hour-label">{{ data?.label }}</div>
    <div class="half-hour"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  blockId?: string
  data?: { label: string }
  children?: any[]
}>()
</script>

<style scoped>
.time-label {
  height: calc(100% / 24);
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  padding-right: 8px;
  /* border-bottom: 1px solid #e5e7eb; */ /* Removed to avoid double lines with grid */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
.hour-label {
  position: absolute;
  bottom: -1px;
  right: 8px;
  background: transparent;
  padding: 0 2px;
  z-index: 1;
  transform: translateY(50%);
}
.half-hour {
  height: 30px;
  /* border-bottom: 1px dashed #f3f4f6; */ /* Removed to avoid double lines with grid */
}
</style>
