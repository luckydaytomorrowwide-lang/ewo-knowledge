<template>
  <div class="input-file-wrapper">
    <label class="input-file-label" :class="{ 'has-file': fileName }">
      <span class="file-name">{{ fileName || placeholder }}</span>
      <input 
        type="file" 
        class="input-file-block"
        :data-cell="inputCell"
        :data-block-id="blockId"
        @change="handleChange"
      />
      <div class="file-button">Browse</div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue'
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
  'update:value': [value: File | null]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any

const fileName = ref('')
const placeholder = computed(() => props.data?.placeholder || 'Select a file...')
const inputCell = computed(() => props.data?.cell || '')

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] || null
  fileName.value = file ? file.name : ''
  
  console.log('[InputFileBlock] File selected:', {
    blockId: props.blockId,
    fileName: fileName.value,
    key: inputCell.value
  })
  
  if (eventBus && eventBus.handlers && eventBus.handlers.onInput) {
    eventBus.handlers.onInput({
      blockId: props.blockId,
      value: file,
      key: inputCell.value
    })
  }

  emit('update:value', file)
}
</script>

<style scoped>
.input-file-wrapper {
  display: inline-flex;
  width: 100%;
}

.input-file-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  color: #718096;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.input-file-label:hover {
  border-color: #4299e1;
}

.input-file-label.has-file {
  color: #2d3748;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.input-file-block {
  display: none;
}

.file-button {
  padding: 4px 12px;
  background: #edf2f7;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  flex-shrink: 0;
}

.input-file-label:hover .file-button {
  background: #4299e1;
  color: white;
}
</style>
