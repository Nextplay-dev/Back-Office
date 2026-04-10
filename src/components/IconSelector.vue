<script setup lang="ts">
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, X } from 'lucide-vue-next'
import CategoryIcon from './CategoryIcon.vue'

const props = defineProps<{
  modelValue: string
  color?: string
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const results = ref<string[]>([])
const loading = ref(false)
const isOpen = ref(false)

function fromIconify(iconifyName: string) {
  const [prefix, name] = iconifyName.split(':')
  const lib = prefix === 'mdi' ? 'MaterialCommunityIcons' : 'Ionicons'
  return `${lib}/${name}`
}

async function searchIcons() {
  if (!searchQuery.value) {
    results.value = []
    return
  }
  loading.value = true
  try {
    const { data } = await axios.get('https://api.iconify.design/search', {
      params: {
        query: searchQuery.value,
        prefixes: 'mdi,ion',
        limit: 48,
      },
    })
    results.value = data.icons || []
  } catch (error) {
    console.error('Failed to fetch icons:', error)
  } finally {
    loading.value = false
  }
}

watchDebounced(searchQuery, searchIcons, { debounce: 300 })

function selectIcon(iconName: string) {
  emit('update:modelValue', fromIconify(iconName))
  isOpen.value = false
}

function handleOpenChange(open: boolean) {
  isOpen.value = open
  if (!open) {
    searchQuery.value = ''
    results.value = []
  }
}
</script>

<template>
  <div class="w-full">
    <div class="flex gap-2 items-center w-full">
      <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogTrigger as-child>
          <Button
            variant="outline"
            type="button"
            class="flex-1 justify-start gap-3 h-11 px-3 font-normal bg-background hover:bg-muted/50 transition-colors border-2 hover:border-primary/20"
          >
            <div class="h-7 w-7 flex items-center justify-center rounded-lg bg-muted/80 text-primary border border-primary/10 shrink-0 shadow-sm">
              <CategoryIcon :icon="modelValue" :color="color" size="20" />
            </div>
            <span v-if="modelValue" class="truncate text-sm font-medium">{{ modelValue }}</span>
            <span v-else class="text-muted-foreground text-sm italic">{{ $t('components.iconSelector.placeholder') }}</span>
          </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-xl p-0 overflow-hidden gap-0 border-none shadow-2xl">
          <DialogHeader class="p-6 pb-4 bg-linear-to-br from-primary/10 via-transparent to-transparent">
            <DialogTitle class="text-xl font-bold flex items-center gap-2">
              <Search class="h-5 w-5 text-primary" />
              {{ $t('components.iconSelector.title') }}
            </DialogTitle>
            <p class="text-sm text-muted-foreground mt-1">{{ $t('components.iconSelector.description') }}</p>
          </DialogHeader>

          <div class="px-6 pb-6 space-y-4">
            <div class="relative group">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                v-model="searchQuery"
                :placeholder="$t('components.iconSelector.searchPlaceholder')"
                class="pl-11 h-12 text-base border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/20 rounded-xl"
                auto-focus
              />
            </div>

            <div class="min-h-[350px] max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
                <Loader2 class="h-10 w-10 animate-spin text-primary" />
                <p class="text-sm font-medium animate-pulse">{{ $t('components.iconSelector.loading') }}</p>
              </div>

              <div v-else-if="results.length" class="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-1">
                <button
                  v-for="iconName in results"
                  :key="iconName"
                  type="button"
                  class="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all group relative overflow-hidden"
                  @click="selectIcon(iconName)"
                >
                  <div class="h-12 w-12 flex items-center justify-center rounded-lg bg-muted/30 border border-border group-hover:bg-background transition-colors mb-2">
                    <Icon
                      :icon="iconName"
                      width="28"
                      height="28"
                      :style="{ color: color || 'currentColor' }"
                      class="group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-tight truncate w-full text-center px-1">
                    {{ iconName.split(':')[1] }}
                  </span>
                  <div class="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
                </button>
              </div>

              <div v-else-if="searchQuery" class="flex flex-col items-center justify-center py-24 text-muted-foreground text-center">
                <div class="h-20 w-20 flex items-center justify-center rounded-full bg-muted/50 mb-4">
                  <Search class="h-10 w-10 opacity-20" />
                </div>
                <p class="text-base font-medium">{{ $t('components.iconSelector.noResultsTitle') }}</p>
                <p class="text-sm opacity-60">{{ $t('components.iconSelector.noResultsDesc') }}</p>
              </div>

              <div v-else class="flex flex-col items-center justify-center py-24 text-muted-foreground text-center">
                <div class="h-20 w-20 flex items-center justify-center rounded-full bg-primary/5 mb-4">
                  <Icon icon="ion:sparkles-outline" class="h-10 w-10 text-primary opacity-40" />
                </div>
                <p class="text-base font-medium text-foreground">{{ $t('components.iconSelector.emptyTitle') }}</p>
                <p class="text-sm opacity-60">{{ $t('components.iconSelector.emptyDesc') }}</p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-muted/50 border-t flex justify-between items-center text-[11px] font-semibold text-muted-foreground px-6">
            <div class="flex items-center gap-1.5 opacity-70">
              <Icon icon="mdi:web" class="h-3.5 w-3.5" />
              Powered by Iconify API
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        v-if="modelValue"
        variant="ghost"
        size="icon"
        type="button"
        class="h-11 w-11 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
        @click="emit('update:modelValue', '')"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.15);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.3);
}
</style>
