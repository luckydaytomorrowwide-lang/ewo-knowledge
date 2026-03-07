<template>
  <div class="input-textarea-wrapper">
    <textarea 
      class="input-textarea-block"
      :value="inputValue"
      :placeholder="inputPlaceholder"
      :data-cell="inputCell"
      :data-block-id="blockId"
      @input="handleInput"
      rows="4"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  blockId?: string
  data?: {
    value?: string
    placeholder?: string
    cell?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: string]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any

const inputValue = computed(() => props.data?.value || '')
const inputPlaceholder = computed(() => props.data?.placeholder || '')
const inputCell = computed(() => props.data?.cell || '')

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  console.log('[InputTextareaBlock] Input changed:', {
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
</script>

<style scoped>
.input-textarea-wrapper {
  display: flex;
  width: 100%;
}

.input-textarea-block {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  color: #2d3748;
  background: white;
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 100px;
}

.input-textarea-block::placeholder {
  color: #a0aec0;
}

.input-textarea-block:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}
</style>
