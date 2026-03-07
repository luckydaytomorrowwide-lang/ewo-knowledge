<template>
  <div class="avatar-block">
    <svg class="avatar-icon" :class="avatarData?.color" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="8" r="4" stroke-width="2"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke-width="2"/>
    </svg>
    <div class="avatar-name">{{ avatarData?.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVNodeDataStore } from '~/stores/vnodeData'

interface Props {
  rowKey?: string
  data?: {
    name: string
    color?: 'blue' | 'green' | 'red'
  }
  children?: any[] // Prevent fallthrough warning
}

const props = defineProps<Props>()
const store = useVNodeDataStore()

const avatarData = computed(() => {
  if (props.rowKey) {
    return store.getData(props.rowKey)?.avatar
  }
  return props.data
})
</script>

<style scoped>
.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-icon {
  width: 64px;
  height: 64px;
  padding: 8px;
  border-radius: 50%;
  background: white;
  border: 3px solid;
}

.avatar-icon.blue {
  color: #4299e1;
  border-color: #4299e1;
}

.avatar-icon.green {
  color: #48bb78;
  border-color: #48bb78;
}

.avatar-icon.red {
  color: #f56565;
  border-color: #f56565;
}

.avatar-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
}
</style>
