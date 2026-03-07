<template>
  <input 
    type="checkbox" 
    class="checkbox-block"
    :checked="data?.checked"
    @change="handleChange"
    :data-card-id="blockId"
    data-file="CheckboxBlock.vue"
  />
</template>

<script setup lang="ts">
interface Props {
  blockId?: string
  data?: {
    checked?: boolean
    cardId?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:checked', checked: boolean, cardId?: string): void
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const checked = target.checked
  
  console.log('[CheckboxBlock] Changed:', {
    blockId: props.blockId,
    cardId: props.data?.cardId,
    checked
  })
  
  emit('update:checked', checked, props.data?.cardId)
}
</script>

<style scoped>
.checkbox-block {
  width: 24px;
  height: 24px;
  border: 2px solid #a0aec0;
  border-radius: 4px;
  cursor: pointer;
}

.checkbox-block:checked {
  background: #4299e1;
  border-color: #4299e1;
}
</style>
