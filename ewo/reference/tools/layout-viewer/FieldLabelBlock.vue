<template>
  <div class="field-label-wrapper">
    <div class="field-label-block" :style="data?.style">
      {{ labelText }}
    </div>
    <div class="field-label-actions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  blockId?: string;  // 属するBlockのID
  data?: {
    text?: string
    value?: string
    style?: any
  }
}

const props = defineProps<Props>()

const labelText = computed(() => {
  const d = props.data
  if (!d) return ''
  
  // value または text を優先
  return d.value || d.text || ''
})
</script>

<style scoped>
.field-label-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.field-label-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  background: #fef3c7; /* Light yellow/orange as seen in images */
  border: 2px solid #f59e0b;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  min-height: 36px;
}

.field-label-actions {
  display: inline-flex;
  gap: 4px;
}
</style>
