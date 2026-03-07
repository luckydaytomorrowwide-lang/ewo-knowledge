<template>
  <div class="input-checkbox-wrapper">
    <label class="input-checkbox-label">
      <input 
        type="checkbox" 
        class="input-checkbox-block"
        :checked="isChecked"
        :data-cell="inputCell"
        :data-block-id="blockId"
        @change="handleChange"
      />
      <span v-if="labelText" class="checkbox-text">{{ labelText }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  blockId?: string
  data?: {
    value?: boolean | string | number
    label?: string
    cell?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: boolean]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any

const isChecked = computed(() => {
  const val = props.data?.value
  if (typeof val === 'boolean') return val
  if (val === 'true' || val === 1 || val === '1') return true
  return false
})

const labelText = computed(() => props.data?.label || props.data?.value || '')
const inputCell = computed(() => props.data?.cell || '')

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const checked = target.checked
  console.log('[InputCheckboxBlock] Changed:', {
    blockId: props.blockId,
    value: checked,
    key: inputCell.value
  })
  
  if (eventBus && eventBus.handlers && eventBus.handlers.onInput) {
    eventBus.handlers.onInput({
      blockId: props.blockId,
      value: checked,
      key: inputCell.value
    })
  }

  emit('update:value', checked)
}
</script>

<style scoped>
.input-checkbox-wrapper {
  display: inline-flex;
  align-items: center;
}

.input-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.input-checkbox-block {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: #2d3748;
}
</style>
