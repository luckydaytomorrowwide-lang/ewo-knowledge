<template>
  <div 
    v-if="node" 
    class="layout-renderer-item"
    :class="{ 'debug-other-border': showDebugBorders && node.type !== 'card' }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div 
      v-if="showDebugBorders && node.type !== 'card' && isHovered" 
      class="debug-label-container"
    >
      <div 
        class="debug-label"
        @click.stop="copyToClipboard"
        :class="{ 'copied': showCopiedFeedback }"
      >
        {{ showCopiedFeedback ? 'Copied!' : node.key }}
      </div>
    </div>

    <component
      :is="componentType"
      v-bind="componentProps"
      :data="node.data"
    >
      <!-- 子ノードを再帰的にレンダリング -->
      <LayoutRenderer
        v-for="(child, index) in node.children"
        :key="`${child.key}-${index}`"
        :node="child"
      />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, inject, ref, type Ref } from 'vue'
import type { MergedLayoutNode } from './utils/mergeLayoutAndDataV3'

// コンポーネント群のインポート
import CardBlock from './CardBlock.vue'
import HeaderBlock from './HeaderBlock.vue'
import AvatarBlock from './AvatarBlock.vue'
import ActionButtonBlock from './ActionButtonBlock.vue'
import ActionTabBlock from './ActionTabBlock.vue'
import TextLabelBlock from './TextLabelBlock.vue'
import TextValueBlock from './TextValueBlock.vue'
import FieldLabelBlock from './FieldLabelBlock.vue'
import InputFieldBlock from './InputFieldBlock.vue'
import CheckboxBlock from './CheckboxBlock.vue'
import InputSelectBlock from './InputSelectBlock.vue'
import InputTextBlock from './InputTextBlock.vue'
import InputTextareaBlock from './InputTextareaBlock.vue'
import InputCheckboxBlock from './InputCheckboxBlock.vue'
import InputRadioBlock from './InputRadioBlock.vue'
import InputFileBlock from './InputFileBlock.vue'
import InputNumberBlock from './InputNumberBlock.vue'
import InputBooleanBlock from './InputBooleanBlock.vue'
import CalendarBlock from './CalendarBlock.vue'
import ContainerBlock from './calendar/ContainerBlock.vue'
import HeaderBlockCustom from './calendar/HeaderBlock.vue'
import GridContainerBlock from './calendar/GridContainerBlock.vue'
import TimeAxisBlock from './calendar/TimeAxisBlock.vue'
import DayColumnBlock from './calendar/DayColumnBlock.vue'
import EventBlock from './calendar/EventBlock.vue'
import FooterBlock from './calendar/FooterBlock.vue'
import TimeLabelBlock from './calendar/TimeLabelBlock.vue'

interface Props {
  node: MergedLayoutNode | null
}

const props = defineProps<Props>()

// 親からshowDebugBordersを取得
const showDebugBorders = inject<Ref<boolean>>('showDebugBorders', { value: false } as Ref<boolean>)

const isHovered = ref(false)
const showCopiedFeedback = ref(false)
const componentModules = import.meta.glob('../../components/**/*.vue')

const copyToClipboard = async () => {
  if (props.node?.key) {
    try {
      await navigator.clipboard.writeText(props.node.key)
      showCopiedFeedback.value = true
      setTimeout(() => {
        showCopiedFeedback.value = false
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}

// タイプとコンポーネントのマッピング
const componentMap: Record<string, any> = {
  // 新フォーマット（キャメルケース）
  card: CardBlock,
  header: HeaderBlock,
  avatar: AvatarBlock,
  actionButton: ActionButtonBlock,
  actionTab: ActionTabBlock,
  textLabel: TextLabelBlock,
  textValue: TextValueBlock,
  fieldLabel: FieldLabelBlock,
  inputField: InputFieldBlock,
  inputText: InputTextBlock,
  input: InputFieldBlock,
  checkbox: CheckboxBlock,
  inputSelect: InputSelectBlock,
  inputTextarea: InputTextareaBlock,
  inputCheckbox: InputCheckboxBlock,
  inputRadio: InputRadioBlock,
  inputFile: InputFileBlock,
  inputNumber: InputNumberBlock,
  inputBoolean: InputBooleanBlock,
  calendar: CalendarBlock,
  fullCalendar: CalendarBlock,
  // 旧フォーマット（ハイフン区切り）- 後方互換性のため
  'action-button': ActionButtonBlock,
  'text-label': TextLabelBlock,
  'text-value': TextValueBlock,
  'field-label': FieldLabelBlock,
  'input-field': InputFieldBlock
}

// コンポーネントタイプを解決
const componentType = computed(() => {
  if (!props.node) return 'div'
  const type = props.node.type

  // Handle slot-based rendering for calendar container
  if (type === 'blocks/calendar/container') {
    return ContainerBlock
  }

  // パス指定がある場合（例: blocks/calendar/calendarEvent）
  if (type.includes('/')) {
    const segments = type.split('/')
    const lastSegment = segments[segments.length - 1]
    // 最後を PascalCase + Block に変換
    const componentName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) + 'Block.vue'
    const path = segments.slice(0, -1).join('/') + '/' + componentName

    // 型定義のために any でキャストして返す
    return defineAsyncComponent({
      loader: () => {
        const modulePath = `../../components/${path}`
        const moduleLoader = componentModules[modulePath]

        if (!moduleLoader) {
          return Promise.reject(new Error(`[LayoutRenderer] Component module not found: ${modulePath}`))
        }

        return moduleLoader()
      },
      onError(error, retry, fail, attempts) {
        console.error(`[LayoutRenderer] Failed to load dynamic component: ${path}`, error)
        fail()
      }
    }) as any
  }

  const comp = componentMap[type]
  if (!comp) {
    console.warn(`[LayoutRenderer] Unknown component type: ${type}`)
    return 'div'
  }
  return comp
})

// 標準HTML要素かどうかの判定
const isHtmlElement = computed(() => {
  return typeof componentType.value === 'string' && !componentType.value.includes('-')
})

// コンポーネントに渡すprops
const componentProps = computed(() => {
  if (!props.node) return {}
  const p = {
    ...props.node.layoutProps,
    blockId: props.node.key,  // 完全なパスをblockIdとして渡す
    // スタイル制御用のプロパティを拡張
    style: {
      flex: props.node.layoutProps?.flex || (props.node.type === 'inputText' ? '1' : 'none'),
      ...props.node.layoutProps?.style
    },
    // デバッグ用の属性
    'data-component-type': props.node.type,
    'data-key': props.node.key
  }

  // 標準HTML要素でない場合は children を渡す
  if (!isHtmlElement.value) {
    Object.assign(p, { children: props.node.children || [] })
  }

  return p
})
</script>

<style scoped>
.layout-renderer-item {
  display: contents; /* 子要素のレイアウトを壊さないようにする */
}

/* CardBlock以外のデバッグ用赤枠 */
.layout-renderer-item.debug-other-border :deep(> *) {
  border: 1px solid #ef4444 !important; /* red-500 */
  margin: 1px !important;
  position: relative;
}

/* ラベル表示用のコンテナ：対象要素の直前に配置されるが、対象要素が position: relative なのでそれに合わせる */
.debug-label-container {
  display: block;
  height: 0;
  width: 0;
  position: relative;
  z-index: 10000;
}

.debug-label {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-bottom-left-radius: 4px;
  font-family: monospace;
  opacity: 0.9;
  cursor: pointer;
  white-space: nowrap;
}

.debug-label.copied {
  background: #10b981;
}
</style>
