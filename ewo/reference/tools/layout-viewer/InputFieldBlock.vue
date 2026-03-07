<template>
  <div class="input-field-wrapper">
    <input 
      type="text" 
      class="input-field-block"
      :value="inputValue"
      :placeholder="inputPlaceholder"
      :data-cell="inputCell"
      :data-block-id="blockId"
      @input="handleInput"
      @keyup.enter="handleEnter"
    />
    <div class="input-field-actions">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  blockId?: string
  placeholder?: string
  cell?: string
  data?: {
    value?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: string]
  'enter': [value: string]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any

// データからvalueを取得。placeholderとcellはpropsから直接取得
const inputValue = computed(() => props.data?.value || '')
const inputPlaceholder = computed(() => props.placeholder || '')
const inputCell = computed(() => props.cell || '')

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  console.log('[InputFieldBlock] Input changed:', {
    blockId: props.blockId,
    value: target.value,
    key: inputCell.value
  })
  
  if (eventBus && eventBus.handlers && eventBus.handlers.onInput) {
    eventBus.handlers.onInput({
      blockId: props.blockId,
      value: target.value,
      key: inputCell.value
    })
  }

  emit('update:value', target.value)
}

const handleEnter = (e: KeyboardEvent) => {
  const target = e.target as HTMLInputElement
  console.log('[InputFieldBlock] Enter pressed:', {
    blockId: props.blockId,
    value: target.value
  })
  emit('enter', target.value)
}
</script>

<style scoped>
.input-field-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.input-field-block {
  flex: 1;
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 13px;
  color: #0f172a;
  background: white;
  min-height: 28px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.input-field-block::placeholder {
  color: #94a3b8;
}

.input-field-block:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-field-actions {
  display: inline-flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
