<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  icon?: string | null
  color?: string | null
  size?: number | string
}>()

const DEFAULT_LIBRARY = 'ion'
const DEFAULT_ICON = 'trophy-outline'

const resolvedIcon = computed(() => {
  if (!props.icon) return `${DEFAULT_LIBRARY}:${DEFAULT_ICON}`

  if (props.icon.includes('/')) {
    const [library, name] = props.icon.split('/', 2)
    const iconifyLibrary = library === 'MaterialCommunityIcons' ? 'mdi' : 'ion'
    return `${iconifyLibrary}:${name}`
  }

  // Fallback for icons that might already be in Iconify format or just a name (emoji/char)
  // If it's a single character or emoji, we don't use Iconify, we just display it.
  // But for now, let's assume if it doesn't contain / or :, it's a name we prefix with DEFAULT_LIBRARY
  if (props.icon.includes(':')) return props.icon

  // Try to detect if it's an emoji (very basic check)
  if (props.icon.length <= 2) return null

  return `${DEFAULT_LIBRARY}:${props.icon || DEFAULT_ICON}`
})
</script>

<template>
  <div class="inline-flex items-center justify-center">
    <Icon
      v-if="resolvedIcon"
      :icon="resolvedIcon"
      :style="{ color: props.color || 'currentColor' }"
      :width="props.size || '1.25em'"
      :height="props.size || '1.25em'"
    />
    <span v-else class="leading-none" :style="{ color: props.color || 'currentColor', fontSize: props.size ? (typeof props.size === 'number' ? props.size + 'px' : props.size) : 'inherit' }">
      {{ props.icon }}
    </span>
  </div>
</template>
