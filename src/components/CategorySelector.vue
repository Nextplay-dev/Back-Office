<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { watchDebounced, useInfiniteScroll } from '@vueuse/core'
import { categoryRoutes } from '@/plugins/routes'
import type { CategoryModel } from '@/models/CategoryModel'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, X, Check, ChevronRight } from 'lucide-vue-next'
import CategoryIcon from './CategoryIcon.vue'

const props = defineProps<{
  modelValue: number | null
  placeholder?: string
  color?: string
  readonly?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const categories = ref<CategoryModel[]>([])
const selectedCategory = ref<CategoryModel | null>(null)
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const isOpen = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

async function fetchCategories(reset = false) {
  if (reset) {
    page.value = 1
    categories.value = []
    lastPage.value = 1
  }

  if (!reset && page.value > lastPage.value) return

  loading.value = true
  try {
    const { data } = await categoryRoutes.list(page.value, searchQuery.value)
    if (reset) {
      categories.value = data.data
    } else {
      categories.value = [...categories.value, ...data.data]
    }
    lastPage.value = data.meta.last_page
    page.value++
  } finally {
    loading.value = false
  }
}

watchDebounced(searchQuery, () => fetchCategories(true), { debounce: 300 })

useInfiniteScroll(
  scrollContainer,
  () => {
    if (!loading.value && page.value <= lastPage.value) {
      fetchCategories()
    }
  },
  { distance: 20 }
)

watch(
  () => props.modelValue,
  async (newId) => {
    if (newId) {
      if (selectedCategory.value?.id !== newId) {
        try {
          const { data } = await categoryRoutes.get(newId)
          selectedCategory.value = data
        } catch {
          selectedCategory.value = null
        }
      }
    } else {
      selectedCategory.value = null
    }
  },
  { immediate: true }
)

const filteredCategories = computed(() => {
  if (!props.modelValue) return categories.value
  return categories.value.filter((c) => c.id !== props.modelValue)
})

function selectCategory(cat: CategoryModel) {
  emit('update:modelValue', cat.id)
  isOpen.value = false
}

function handleOpenChange(open: boolean) {
  isOpen.value = open
  if (open) {
    searchQuery.value = ''
    fetchCategories(true)
  }
}
</script>

<template>
  <div class="w-full" :class="{ 'pointer-events-none': readonly }">
    <div class="flex gap-2 items-center w-full">
      <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogTrigger as-child>
          <Button variant="outline" type="button"
            class="flex-1 justify-start gap-3 h-11 px-3 font-normal bg-background hover:bg-muted/50 transition-colors border-2 hover:border-primary/20">
            <div v-if="selectedCategory"
              class="h-7 w-7 flex items-center justify-center rounded-lg bg-muted/80 text-primary border border-primary/10 shrink-0 shadow-sm">
              <CategoryIcon :icon="selectedCategory.icon" :color="selectedCategory.color" size="20" />
            </div>
            <div v-else class="h-7 w-7 flex items-center justify-center rounded-lg bg-muted font-bold text-xs shrink-0">
              ?
            </div>
            <span v-if="selectedCategory" class="truncate text-sm font-medium">{{ selectedCategory.name }}</span>
            <span v-else class="text-muted-foreground text-sm italic">{{ placeholder ||
              $t('components.categorySelector.placeholder') }}</span>
            <ChevronRight v-if="!readonly" class="ml-auto h-4 w-4 text-muted-foreground opacity-50" />
          </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-md p-0 overflow-hidden gap-0 border-none shadow-2xl">
          <DialogHeader class="p-6 pb-4 bg-linear-to-br from-primary/10 via-transparent to-transparent">
            <DialogTitle class="text-xl font-bold flex items-center gap-2">
              <Search class="h-5 w-5 text-primary" />
              {{ $t('components.categorySelector.title') }}
            </DialogTitle>
            <p class="text-sm text-muted-foreground mt-1">{{ $t('components.categorySelector.description') }}</p>
          </DialogHeader>

          <div class="px-6 space-y-4">
            <div class="relative group">
              <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input v-model="searchQuery" :placeholder="$t('components.categorySelector.searchPlaceholder')"
                class="pl-11 h-12 text-base border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/20 rounded-xl"
                auto-focus />
            </div>

            <div ref="scrollContainer" class="min-h-[300px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div class="space-y-1.5 p-1">
                <!-- Selected Category at Top -->
                <div v-if="selectedCategory && !searchQuery" class="mb-4">
                  <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                    {{ $t('components.categorySelector.currentSelection') }}
                  </p>
                  <button type="button"
                    class="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-left transition-all group"
                    @click="isOpen = false">
                    <div
                      class="h-10 w-10 flex items-center justify-center rounded-lg bg-background border border-primary/20 shadow-sm">
                      <CategoryIcon :icon="selectedCategory.icon" :color="selectedCategory.color" size="24" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-foreground truncate">{{ selectedCategory.name }}</p>
                      <p class="text-[10px] text-muted-foreground font-mono uppercase">{{ selectedCategory.color || `No
                        color` }}</p>
                    </div>
                    <div
                      class="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Check class="h-3.5 w-3.5 stroke-3" />
                    </div>
                  </button>
                  <div class="h-px bg-border my-4 mx-2"></div>
                </div>

                <!-- List Results -->
                <p v-if="filteredCategories.length && !searchQuery"
                  class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                  {{ $t('components.categorySelector.allCategories') }}
                </p>

                <button v-for="cat in filteredCategories" :key="cat.id" type="button"
                  class="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-muted/50 text-left transition-all group"
                  @click="selectCategory(cat)">
                  <div
                    class="h-10 w-10 flex items-center justify-center rounded-lg bg-muted/50 border border-border group-hover:bg-background transition-colors">
                    <CategoryIcon :icon="cat.icon" :color="cat.color" size="24" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {{ cat.name }}</p>
                    <p class="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">ID: {{ cat.id }}
                    </p>
                  </div>
                  <ChevronRight
                    class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                </button>

                <!-- Loading State -->
                <div v-if="loading" class="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 class="h-4 w-4 animate-spin text-primary" />
                  <span class="text-xs font-medium">{{ $t('components.categorySelector.loadingMore') }}</span>
                </div>

                <!-- No Results -->
                <div v-if="!loading && !categories.length && searchQuery"
                  class="py-12 text-center text-muted-foreground">
                  <Search class="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p class="text-sm font-medium">{{ $t('components.categorySelector.noResults', { query: searchQuery })
                  }}</p>
                </div>

                <div v-if="!loading && !categories.length && !searchQuery"
                  class="py-12 text-center text-muted-foreground">
                  <Loader2 class="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p class="text-sm font-medium">{{ $t('components.categorySelector.fetching') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="p-4 bg-muted/50 border-t flex justify-between items-center text-[10px] font-bold text-muted-foreground px-6 uppercase tracking-widest">

          </div>
        </DialogContent>
      </Dialog>
      <Button v-if="modelValue && !readonly" variant="ghost" size="icon" type="button"
        class="h-11 w-11 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
        @click="emit('update:modelValue', null)">
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
