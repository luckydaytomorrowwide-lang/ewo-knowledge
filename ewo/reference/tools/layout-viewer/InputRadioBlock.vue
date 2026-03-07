<template>
  <div class="input-radio-group">
    <label 
      v-for="opt in options"
      :key="opt"
      class="input-radio-item" 
      :class="{ 'checked': isChecked(opt) }"
      :style="radioData?.style"
    >
      <input 
        type="radio"
        :name="radioGroupName"
        :value="opt"
        :checked="isChecked(opt)"
        class="radio-input"
        @change="handleClick(opt)"
      >
      <div class="radio-circle">
        <div v-if="isChecked(opt)" class="radio-dot"></div>
      </div>
      <div class="radio-label">
        {{ opt }}
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useVNodeDataStore, type InputRadioData } from '~/stores/vnodeData'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  rowKey?: string
  blockId?: string // LayoutRenderer から渡される一意のID
  data?: InputRadioData
}

const props = defineProps<Props>()
const store = useVNodeDataStore()
const eventBus = inject(EVENT_BUS_KEY, null) as any

const radioData = computed(() => {
  if (props.rowKey) {
    return store.getData(props.rowKey)?.inputRadio
  }
  return props.data
})

const radioGroupName = computed(() => {
  return props.blockId || props.rowKey || 'radio-group-' + Math.random().toString(36).slice(2, 9)
})

const options = computed(() => {
  if (radioData.value?.option && Array.isArray(radioData.value.option)) {
    return radioData.value.option
  }
  // optionが配列でない場合、単一の選択肢として扱うか、デフォルト値を返す
  const singleLabel = radioData.value?.text || radioData.value?.label || radioData.value?.value || props.rowKey || ''
  return singleLabel ? [singleLabel] : []
})

const isChecked = (opt: string) => {
  const checked = (radioData.value?.option && Array.isArray(radioData.value.option))
    ? String(radioData.value.value) === String(opt)
    : !!radioData.value?.checked
  return checked
}

const handleClick = (opt: string) => {
  // EventBus 経由で通知（他の入力コンポーネントと統一）
  if (eventBus && eventBus.handlers && eventBus.handlers.onInput) {
    eventBus.handlers.onInput({
      blockId: props.blockId || props.rowKey,
      value: opt
    })
  }

  // 個別の onClick がある場合は呼び出す
  if (radioData.value?.onClick) {
    radioData.value.onClick(opt)
  }
}
</script>

<style scoped>
.input-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.input-radio-item {
  padding: 10px 12px;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.input-radio-item:hover {
  background: #f8fafc;
}

.input-radio-item.checked {
  background: #eff6ff;
}

.radio-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border: 2px solid #94a3b8;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.input-radio-item.checked .radio-circle {
  border-color: #3b82f6;
  background: #fff;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
}

.radio-label {
  flex-grow: 1;
  color: #334155;
  font-size: 14px;
}

.input-radio-item.checked .radio-label {
  color: #1e40af;
  font-weight: 500;
}
</style>
