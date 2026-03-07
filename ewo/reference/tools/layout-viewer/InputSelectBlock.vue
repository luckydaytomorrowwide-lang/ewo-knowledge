<template>
  <div class="input-select-wrapper">
    <select 
      class="input-select-block"
      :value="selectedValue"
      :data-cell="inputCell"
      :data-block-id="blockId"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <option 
        v-for="opt in option"
        :key="opt"
        :value="opt"
      >
        {{ opt }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  blockId?: string
  data?: {
    value?: string | number
    placeholder?: string
    option?: any
    cell?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: string | number]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any

const selectedValue = computed(() => props.data?.value ?? '')
const placeholder = computed(() => props.data?.placeholder || '')
const option = computed(() => props.data?.option || '')
const inputCell = computed(() => props.data?.cell || '')

const handleChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  const value = target.value
  console.log('[InputSelectBlock] Changed:', {
    blockId: props.blockId,
    value: value,
    key: inputCell.value
  })
  
  if (eventBus && eventBus.handlers && eventBus.handlers.onInput) {
    eventBus.handlers.onInput({
      blockId: props.blockId,
      value: value,
      key: inputCell.value
    })
  }

  emit('update:value', value)
}
</script>

<style scoped>
.input-select-wrapper {
  display: inline-flex;
  width: 100%;
}

.input-select-block {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  color: #2d3748;
  background: white;
  cursor: pointer;
}

.input-select-block:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}
</style>
