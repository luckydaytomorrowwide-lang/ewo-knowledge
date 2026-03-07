<template>
  <div 
    :class="[
      layout || 'horizontal',
      background,
      border,
      justify,
      { 'debug-card-border': showBorders }
    ]" 
    class="card-block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div 
      v-if="showBorders && blockId && isHovered" 
      class="debug-label"
      @click.stop="copyToClipboard"
      :class="{ 'copied': showCopiedFeedback }"
    >
      {{ showCopiedFeedback ? 'Copied!' : blockId }}
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { inject, type Ref, ref } from 'vue'

interface Props {
  blockId?: string;  // 属するBlockのID
  layout?: 'vertical' | 'horizontal' | 'grid';
  background?: 'white' | 'light' | 'card' | 'blue-light' | 'green-light' | 'green-card' | 'yellow-light' | 'orange-light';
  border?: 'rounded' | 'rounded-top' | 'none';
  justify?: 'start' | 'between' | 'end';

  data?: Record<string, any>;
  children?: any[]; // Allow children prop to be consumed to prevent attr fallthrough warnings
}

const props = defineProps<Props>();

// 親からshowDebugBordersを取得
const showBorders = inject<Ref<boolean>>('showDebugBorders', { value: false } as Ref<boolean>)

const isHovered = ref(false)
const showCopiedFeedback = ref(false)

const copyToClipboard = async () => {
  if (props.blockId) {
    try {
      await navigator.clipboard.writeText(props.blockId)
      showCopiedFeedback.value = true
      setTimeout(() => {
        showCopiedFeedback.value = false
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}
</script>

<style scoped>
.card-block {
  display: flex;
  position: relative; /* デバッグラベルの絶対配置用 */
  padding: 0;
  box-sizing: border-box;
}

.card-block.vertical {
  flex-direction: column;
  gap: 1px;
  /* 階層をわかりやすくするためのインデント */
  margin-left: 12px;
}

/* ルートレベル（最初のCardBlock）はインデント不要 */
.card-block.vertical:first-child {
  margin-left: 0;
}

.card-block.horizontal {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.card-block.start {
  justify-content: flex-start;
}

.card-block.between {
  justify-content: space-between;
}

.card-block.end {
  justify-content: flex-end;
}

.card-block.grid {
  display: grid;
  /* 左: チェック+ボタン群 / 中: アバター / 右: 情報（可変） */
  grid-template-columns: auto auto 1fr;
  align-items: center;
}

.card-block.white {
  background: white;
  border: 1px solid #e5e7eb;
}

.card-block.light {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.card-block.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

/* 追加の背景バリエーション（モック図に合わせたトーン） */
.card-block.blue-light {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.card-block.green-light {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.card-block.green-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
}

.card-block.yellow-light {
  background: #fefce8;
  border: 1px solid #fef08a;
}

.card-block.orange-light {
  background: #fff7ed;
  border: 1px solid #ffedd5;
}

.card-block.rounded {
  border-radius: 12px;
}

.card-block.rounded-top {
  border-radius: 12px 12px 0 0;
}

/* デバッグモード時のカードボーダー */
.card-block.debug-card-border {
  border: 2px solid #3b82f6 !important;
  margin: 2px !important;
  padding: 8px !important;
  border-radius: 8px !important;
  box-shadow: none !important;
}

/* デバッグラベル */
.debug-label {
  position: absolute;
  top: 0;
  right: 0;
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-bottom-left-radius: 4px;
  font-family: monospace;
  z-index: 10;
  opacity: 0.9;
  cursor: pointer;
  transition: all 0.2s;
}

.debug-label:hover {
  background: #2563eb;
  opacity: 1;
}

.debug-label.copied {
  background: #10b981; /* Green for success */
}
</style>
