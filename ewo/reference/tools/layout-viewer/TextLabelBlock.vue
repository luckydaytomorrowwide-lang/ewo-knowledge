<template>
  <div class="text-label-wrapper">
    <div class="text-label-block" :style="style">
      {{ labelText }}
    </div>
    <div class="text-label-actions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  blockId?: string;  // 属するBlockのID
  style?: any;
  data?: {
    text?: string
    value?: string
  }
  children?: any[] // Prevent fallthrough warning
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
.text-label-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
}

.text-label-block {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  background: #f8fafc; /* 薄い背景を追加 */
  border: 1px solid #e2e8f0;
  border-radius: 2px;
  padding: 1px 4px;
  font-size: 11px;
  font-weight: 700;
  color: #475569; /* 少し濃く */
  min-height: 14px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.text-label-actions {
  display: inline-flex;
  gap: 4px;
}
</style>
