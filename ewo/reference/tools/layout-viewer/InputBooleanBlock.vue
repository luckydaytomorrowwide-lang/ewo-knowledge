<template>
  <div class="input-boolean-wrapper">
    <div class="input-boolean-toggle" @click="toggle">
      <div 
        class="toggle-switch" 
        :class="{ 'is-active': isTrue }"
      >
        <div class="toggle-handle"></div>
      </div>
      <span class="toggle-label">{{ isTrue ? trueLabel : falseLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  blockId?: string
  data?: {
    value?: boolean | string | number
    trueLabel?: string
    falseLabel?: string
    cell?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: boolean]
}>()

const eventBus = inject(EVENT_BUS_KEY, null) as any

const isTrue = computed(() => {
  const val = props.data?.value
  if (typeof val === 'boolean') return val
  if (val === 'true' || val === 1 || val === '1') return true
  return false
})

const trueLabel = computed(() => props.data?.trueLabel || 'ON')
const falseLabel = computed(() => props.data?.falseLabel || 'OFF')
const inputCell = computed(() => props.data?.cell || '')

const toggle = () => {
  const newValue = !isTrue.value
  console.log('[InputBooleanBlock] Toggled:', {
    blockId: props.blockId,
    value: newValue,
    key: inputCell.value
  })
  
  if (eventBus && eventBus.handlers && eventBus.handlers.onInput) {
    eventBus.handlers.onInput({
      blockId: props.blockId,
      value: newValue,
      key: inputCell.value
    })
  }

  emit('update:value', newValue)
}
</script>

<style scoped>
.input-boolean-wrapper {
  display: inline-flex;
  align-items: center;
}

.input-boolean-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background-color: #cbd5e0;
  border-radius: 999px;
  position: relative;
  transition: background-color 0.2s;
}

.toggle-switch.is-active {
  background-color: #48bb78;
}

.toggle-handle {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.toggle-switch.is-active .toggle-handle {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  min-width: 30px;
}
</style>
