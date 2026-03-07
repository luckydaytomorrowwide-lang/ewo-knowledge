<template>
  <button 
    @click="handleClick"
    class="action-button-block"
    :class="variant"
    data-file="ActionButtonBlock.vue"
  >
    <span v-if="icon" class="button-icon">{{ icon }}</span>
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { EVENT_BUS_KEY } from '../../composables/useEventBus'

interface Props {
  blockId?: string  // 属するBlock의 ID
  variant?: 'primary' | 'secondary' | 'outlined'
  icon?: string
  children?: any[] // TypeError: Cannot set property children 対策 (フォールスルー防止)
  data?: {
    // 新形式
    buttonLabel?: string
    buttonJointId?: string
    // 旧形式（後方互換性のため残す）
    label?: string
    text?: string
    jointId?: string
    // その他
    context?: Record<string, any>
  }
  children?: any[] // Prevent fallthrough warning
}

const props = defineProps<Props>()
const eventBus = inject(EVENT_BUS_KEY, null) as any

const buttonText = computed(() => {
  const d = props.data
  if (!d) return ''
  
  // buttonLabelを優先、label, textにフォールバック
  return d.buttonLabel || d.label || d.text || ''
})

/**
 * ボタンクリック時の処理
 * ビューアモードなので、クリックしても何も起こらない（console.log のみ）
 */
const handleClick = () => {
  const d = props.data
  if (!d) return
  
  console.log('[ActionButtonBlock - Viewer Mode] Button clicked:', {
    blockId: props.blockId,
    label: d.buttonLabel || d.label || d.text,
    jointId: d.buttonJointId || d.jointId
  })

  // EventBus経由で通知
  if (eventBus && eventBus.handlers && eventBus.handlers.onAction) {
    const payload = {
      jointId: d.buttonJointId || d.jointId,
      label: d.buttonLabel || d.label || d.text,
      data: d
    }
    eventBus.handlers.onAction(props.blockId || '', payload)
  }
}
</script>

<style scoped>
.action-button-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #3b82f6;
  white-space: nowrap;
  background: #3b82f6;
  color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-height: 24px;
  margin-left: auto; /* 親要素がflexであれば右側に寄せる */
}

.action-button-block:hover {
  background: #2563eb;
  border-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button-block.primary {
  background: #2563eb;
  border-color: #1d4ed8;
  color: white;
}

.action-button-block.primary:hover {
  background: #1d4ed8;
  border-color: #1e40af;
}

.action-button-block.secondary {
  background: #6b7280;
  border-color: #4b5563;
  color: white;
}

.action-button-block.secondary:hover {
  background: #4b5563;
  border-color: #374151;
}

.action-button-block.outlined {
  background: white;
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-button-block.outlined:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.button-icon {
  font-size: 16px;
}
</style>
