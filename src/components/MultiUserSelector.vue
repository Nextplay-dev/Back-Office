<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { watchDebounced, useInfiniteScroll } from '@vueuse/core'
import { userRoutes } from '@/plugins/routes'
import type { UserModel } from '@/models/UserModel'
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
import { Search, Loader2, X, Check, Users, User } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: number[]
  placeholder?: string
  initialUsers?: UserModel[]
  readonly?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const users = ref<UserModel[]>([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const isOpen = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

// Local cache to keep track of user objects for labels
const userCache = ref<Map<number, UserModel>>(new Map())

// Sync initial users into cache
watch(() => props.initialUsers, (newUsers) => {
  if (newUsers) {
    newUsers.forEach(u => userCache.value.set(u.id, u))
  }
}, { immediate: true })

async function fetchUsers(reset = false) {
  if (reset) {
    page.value = 1
    users.value = []
    lastPage.value = 1
  }

  if (!reset && page.value > lastPage.value) return

  loading.value = true
  try {
    const { data } = await userRoutes.list(page.value, searchQuery.value)
    if (reset) {
      users.value = data.data
    } else {
      users.value = [...users.value, ...data.data]
    }

    // Update cache with anything we find
    data.data.forEach(u => userCache.value.set(u.id, u))

    lastPage.value = data.meta.last_page
    page.value++
  } finally {
    loading.value = false
  }
}

watchDebounced(searchQuery, () => fetchUsers(true), { debounce: 300 })

useInfiniteScroll(
  scrollContainer,
  () => {
    if (!loading.value && page.value <= lastPage.value) {
      fetchUsers()
    }
  },
  { distance: 20 }
)

const selectedUserObjects = computed(() => {
  return props.modelValue.map(id => userCache.value.get(id)).filter((u): u is UserModel => !!u)
})

function isSelected(userId: number) {
  return props.modelValue.includes(userId)
}

function toggleUser(userId: number) {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(userId)
  if (index === -1) {
    newValue.push(userId)
  } else {
    newValue.splice(index, 1)
  }
  emit('update:modelValue', newValue)
}

function handleOpenChange(open: boolean) {
  isOpen.value = open
  if (open) {
    searchQuery.value = ''
    fetchUsers(true)
  }
}
</script>

<template>
  <div class="w-full space-y-3">
    <div
      class="flex flex-wrap gap-2 min-h-12 p-2 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
      <Badge v-for="user in selectedUserObjects" :key="user.id" variant="secondary"
        class="pl-1.5 pr-1 py-1 gap-1.5 h-8 bg-background border-primary/20 hover:bg-background group">
        <div class="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <User class="h-3 w-3" />
        </div>
        <span class="text-xs font-semibold pr-2">{{ user.name }}</span>
        <button type="button" v-if="!readonly"
          class="h-4 w-4 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
          @click="toggleUser(user.id)">
          <X class="h-3 w-3" />
        </button>
      </Badge>

      <div v-if="!modelValue.length" class="flex-1 flex items-center px-2 text-xs text-muted-foreground italic">
        {{ $t('components.userSelector.noManagers') }}
      </div>

      <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogTrigger as-child>
          <Button v-if="!readonly" variant="outline" size="sm" type="button"
            class="ml-auto h-8 gap-2 rounded-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-xs">
            <Users class="h-3.5 w-3.5" />
            {{ $t('components.userSelector.manageAssignments') }}
          </Button>
        </DialogTrigger>

        <DialogContent class="sm:max-w-md p-0 overflow-hidden gap-0 border-none shadow-2xl">
          <DialogHeader class="p-6 pb-4 bg-linear-to-br from-primary/10 via-transparent to-transparent">
            <DialogTitle class="text-xl font-bold flex items-center gap-2">
              <Users class="h-5 w-5 text-primary" />
              {{ $t('components.userSelector.title') }}
            </DialogTitle>
            <p class="text-sm text-muted-foreground mt-1">{{ $t('components.userSelector.description') }}</p>
          </DialogHeader>

          <div class="px-6 pb-6 space-y-4">
            <div class="relative group">
              <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input v-model="searchQuery" :placeholder="$t('components.userSelector.searchPlaceholder')"
                class="pl-11 h-12 text-base border-2 focus-visible:ring-offset-0 focus-visible:ring-primary/20 rounded-xl"
                auto-focus />
            </div>

            <div ref="scrollContainer" class="min-h-[300px] max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div class="space-y-1.5 p-1">
                <button v-for="user in users" :key="user.id" type="button"
                  class="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all group" :class="isSelected(user.id)
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-transparent hover:border-primary/20 hover:bg-muted/50'" @click="toggleUser(user.id)">
                  <div
                    class="h-10 w-10 flex items-center justify-center rounded-full border transition-colors shadow-sm"
                    :class="isSelected(user.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 border-border group-hover:bg-background'">
                    <User class="h-5 w-5" />
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <p
                      class="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {{ user.name }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                  </div>
                  <div class="h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all"
                    :class="isSelected(user.id) ? 'bg-primary border-primary scale-110' : 'border-muted group-hover:border-primary/30'">
                    <Check v-if="isSelected(user.id)" class="h-3.5 w-3.5 text-primary-foreground stroke-3" />
                  </div>
                </button>

                <!-- Loading State -->
                <div v-if="loading" class="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                  <Loader2 class="h-4 w-4 animate-spin text-primary" />
                  <span class="text-xs font-medium">{{ $t('components.userSelector.loading') }}</span>
                </div>

                <!-- No Results -->
                <div v-if="!loading && !users.length && searchQuery" class="py-12 text-center text-muted-foreground">
                  <Search class="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p class="text-sm font-medium">{{ $t('components.userSelector.noResults', { query: searchQuery }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            class="p-4 bg-muted/50 border-t flex justify-between items-center text-[10px] font-bold text-muted-foreground px-6 uppercase tracking-widest">
            <div>{{ $t('components.userSelector.selectedCount', { count: modelValue.length }) }}</div>
            <Button size="sm" class="h-7 px-4 rounded-lg" @click="isOpen = false">{{ $t('common.actions.save')
            }}</Button>
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
