<template>
  <div class="text-value-wrapper">
    <div class="text-value-block" :style="style">
      {{ valueText }}
    </div>
    <div class="text-value-actions">
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
  style?: any // Fix missing style prop for template usage
  children?: any[] // Prevent fallthrough warning
}

const props = defineProps<Props>()

const valueText = computed(() => {
  const d = props.data
  if (!d) return ''
  
  // value または text を優先
  return d.value || d.text || ''
})
</script>

<style scoped>
.text-value-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
}

.text-value-block {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 4px 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 13px;
  color: #0f172a;
  min-height: 28px;
  min-width: 60px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.text-value-actions {
  display: inline-flex;
  gap: 4px;
}
</style>
