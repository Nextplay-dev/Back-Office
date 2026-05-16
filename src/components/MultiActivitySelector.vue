<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { activityRoutes } from '@/plugins/routes'
import type { ActivityModel } from '@/models/ActivityModel'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, X, Check, Activity } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: number[]
  venueId: number
  initialActivities?: ActivityModel[]
  placeholder?: string
  readonly?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const activities = ref<ActivityModel[]>([])
const loading = ref(false)
const isOpen = ref(false)

const activityCache = ref<Map<number, ActivityModel>>(new Map())

watch(
  () => props.initialActivities,
  (newActivities) => {
    if (newActivities) {
      newActivities.forEach(activity => activityCache.value.set(activity.id, activity))
    }
  },
  { immediate: true },
)

async function fetchActivities() {
  loading.value = true
  try {
    const { data } = await activityRoutes.list(props.venueId, searchQuery.value)
    activities.value = data
    data.forEach(activity => activityCache.value.set(activity.id, activity))
  } finally {
    loading.value = false
  }
}

watchDebounced(searchQuery, () => {
  if (isOpen.value) {
    fetchActivities()
  }
}, { debounce: 250 })

const selectedActivityObjects = computed(() => {
  return props.modelValue
    .map(id => activityCache.value.get(id))
    .filter((activity): activity is ActivityModel => !!activity)
})

const availableActivities = computed(() => {
  return activities.value.filter(activity => !props.modelValue.includes(activity.id))
})

function toggleActivity(activityId: number) {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(activityId)

  if (index === -1) {
    newValue.push(activityId)
  } else {
    newValue.splice(index, 1)
  }

  emit('update:modelValue', newValue)
}

function handleOpenChange(open: boolean) {
  isOpen.value = open

  if (open) {
    searchQuery.value = ''
    fetchActivities()
  }
}
</script>

<template>
  <div class="w-full space-y-3">
    <div
      class="flex flex-wrap gap-2 min-h-12 p-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
      <Badge
        v-for="activity in selectedActivityObjects"
        :key="activity.id"
        variant="secondary"
        class="pl-1.5 pr-1 py-1 gap-1.5 h-8 bg-background border-primary/20 hover:bg-background group"
      >
        <div class="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Activity class="h-3 w-3" />
        </div>
        <span class="text-xs font-semibold pr-2">{{ activity.name }}</span>
        <button
          v-if="!readonly"
          type="button"
          class="h-4 w-4 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
          @click="toggleActivity(activity.id)"
        >
          <X class="h-3 w-3" />
        </button>
      </Badge>

      <div v-if="!modelValue.length" class="flex-1 flex items-center px-2 text-xs text-muted-foreground italic">
        {{ $t('components.activitySelector.noActivities') }}
      </div>

      <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogTrigger as-child>
          <Button
            v-if="!readonly"
            variant="outline"
            size="sm"
            type="button"
            class="ml-auto h-8 gap-2 rounded-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs"
          >
            <Activity class="h-3.5 w-3.5" />
            {{ $t('components.activitySelector.manageAssignments') }}
          </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-md p-0 overflow-hidden gap-0 border-none shadow-2xl">
          <DialogHeader class="p-6 pb-4 bg-linear-to-br from-primary/10 via-transparent to-transparent">
            <DialogTitle class="text-xl font-bold flex items-center gap-2">
              <Activity class="h-5 w-5 text-primary" />
              {{ $t('components.activitySelector.title') }}
            </DialogTitle>
            <p class="text-sm text-muted-foreground mt-1">{{ $t('components.activitySelector.description') }}</p>
          </DialogHeader>

          <div class="px-6 pb-6 space-y-4">
            <div class="relative group">
              <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <Input
                v-model="searchQuery"
                :placeholder="$t('components.activitySelector.searchPlaceholder')"
                class="pl-11 h-12 text-base border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/20 rounded-xl"
                auto-focus
              />
            </div>

            <div class="min-h-[300px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div class="space-y-1.5 p-1">
                <div v-if="selectedActivityObjects.length && !searchQuery" class="mb-4">
                  <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                    {{ $t('components.activitySelector.selectedCount', { count: modelValue.length }) }}
                  </p>
                  <div class="space-y-1.5">
                    <button
                      v-for="activity in selectedActivityObjects"
                      :key="activity.id"
                      type="button"
                      class="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-left transition-all group"
                      @click="toggleActivity(activity.id)"
                    >
                      <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-background border border-primary/20 shadow-sm">
                        <Activity class="h-5 w-5 text-primary" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-foreground truncate">{{ activity.name }}</p>
                        <p class="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                          {{ activity.duration_minutes }} min • {{ activity.slot_interval_minutes }} min interval
                        </p>
                      </div>
                      <div class="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Check class="h-3.5 w-3.5 stroke-3" />
                      </div>
                    </button>
                    <div class="h-px bg-border my-4 mx-2"></div>
                  </div>
                </div>

                <p v-if="availableActivities.length && !searchQuery" class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                  {{ $t('components.activitySelector.manageAssignments') }}
                </p>

                <button
                  v-for="activity in availableActivities"
                  :key="activity.id"
                  type="button"
                  class="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-muted/50 text-left transition-all group"
                  @click="toggleActivity(activity.id)"
                >
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-muted/50 border border-border group-hover:bg-background transition-colors">
                    <Activity class="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {{ activity.name }}
                    </p>
                    <p class="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                      {{ activity.duration_minutes }} min • {{ activity.slot_interval_minutes }} min interval
                    </p>
                  </div>
                  <div class="h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all border-muted group-hover:border-primary/30">
                    <Check class="h-3.5 w-3.5 text-primary-foreground stroke-3 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>

                <div v-if="loading" class="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 class="h-4 w-4 animate-spin text-primary" />
                  <span class="text-xs font-medium">{{ $t('components.activitySelector.loading') }}</span>
                </div>

                <div v-if="!loading && !activities.length && searchQuery" class="py-12 text-center text-muted-foreground">
                  <Search class="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p class="text-sm font-medium">{{ $t('components.activitySelector.noResults', { query: searchQuery }) }}</p>
                </div>

                <div v-if="!loading && !activities.length && !searchQuery" class="py-12 text-center text-muted-foreground">
                  <Loader2 class="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p class="text-sm font-medium">{{ $t('components.activitySelector.loading') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-muted/50 border-t flex justify-between items-center text-[10px] font-bold text-muted-foreground px-6 uppercase tracking-widest">
            <div>{{ $t('components.activitySelector.selectedCount', { count: modelValue.length }) }}</div>
            <Button size="sm" class="h-7 px-4 rounded-lg" @click="isOpen = false">{{ $t('common.actions.save') }}</Button>
          </div>
        </DialogContent>
      </Dialog>
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