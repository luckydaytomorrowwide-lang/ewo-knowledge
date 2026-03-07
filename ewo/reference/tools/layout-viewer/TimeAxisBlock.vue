<script setup lang="ts">
import LayoutRenderer from "../LayoutRenderer.vue";

const props = defineProps<{
  blockId?: string
  data?: any
  children?: any[]
}>()
</script>

<template>
  <div class="calendar-time-axis">
    <LayoutRenderer
      v-for="child in children"
      :key="child.key"
      :node="child"
    />
  </div>
</template>

<style scoped>
.calendar-time-axis {
  width: 60px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  /* 全時間帯を確実に表示できるよう、コンテンツ自身は十分な高さを持たせる */
  height: 1440px; /* 24h * 60px */
}
</style>
