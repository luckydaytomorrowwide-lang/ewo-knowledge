<script setup lang="ts">
import LayoutRenderer from '../LayoutRenderer.vue'

const props = defineProps<{
  blockId?: string
  data?: any
  children?: any[]
}>()
</script>

<template>
  <div class="calendar-footer">
    <!-- 統合レイアウトマップ内のchildren（actionButton）がここに描画される -->
    <LayoutRenderer
      v-for="child in children"
      :key="child.key"
      :node="child"
    />
  </div>
</template>

<style scoped>
.calendar-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
