<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissionStore } from '@/stores/permissions'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-vue-next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth'
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  Circle,
  ShieldAlert,
  Search,
  Lock
} from 'lucide-vue-next'

export type ActionType = 'view' | 'create' | 'update' | 'delete' | 'administration' | 'other'
export type ColoredPermission = { id: number, name: string, actionType: ActionType }

interface Props {
  modelValue: number[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { t, te } = useI18n()
const permissionStore = usePermissionStore()
const authStore = useAuthStore()
const search = ref('')

const isPermissionDisabled = (permissionName: string) => {
  return !authStore.hasPermission(permissionName)
}

const ACTION_CONFIG: Record<ActionType, { label: string, icon: any, color: string }> = {
  view: { label: 'view', icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
  create: { label: 'create', icon: Plus, color: 'text-green-500 bg-green-500/10' },
  update: { label: 'update', icon: Pencil, color: 'text-amber-500 bg-amber-500/10' },
  delete: { label: 'delete', icon: Trash2, color: 'text-red-500 bg-red-500/10' },
  administration: { label: 'admin', icon: ShieldAlert, color: 'text-indigo-500 bg-indigo-500/10' },
  other: { label: 'action', icon: Circle, color: 'text-slate-400 bg-slate-400/10' },
}

const formatCategory = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const filteredPermissions = computed(() => {
  const query = search.value.toLowerCase()
  return permissionStore.permissions
    .filter(p => {
      if (!query) return true
      const rawName = p.name.toLowerCase()
      const translationKey = 'permissions.' + p.name
      const translatedName = (te(translationKey) ? t(translationKey) : p.name).toLowerCase()
      return rawName.includes(query) || translatedName.includes(query)
    })
    .map(p => {
      const parts = p.name.split('.')
      const action = parts.pop()
      const isSystem = parts[0] === 'back-office'

      let actionType: ActionType = 'other'

      if (isSystem) actionType = 'administration'
      else if (action === 'view') actionType = 'view'
      else if (action === 'create') actionType = 'create'
      else if (action?.includes('update')) actionType = 'update'
      else if (action === 'delete') actionType = 'delete'

      return { ...p, actionType }
    })
})

const groupedPermissions = computed(() => {
  const orderWeights: Record<ActionType, number> = {
    view: 1, create: 2, update: 3, delete: 4, administration: 5, other: 6
  }

  const sorted = [...filteredPermissions.value].sort((a, b) => {
    const partsA = a.name.split('.')
    const partsB = b.name.split('.')

    if (partsA[0] !== partsB[0]) return partsA[0].localeCompare(partsB[0])

    const baseA = partsA.slice(0, -1).join('.')
    const baseB = partsB.slice(0, -1).join('.')
    if (baseA !== baseB) return baseA.localeCompare(baseB)

    return orderWeights[a.actionType] - orderWeights[b.actionType]
  })

  return sorted.reduce((acc, p) => {
    const category = p.name.split('.')[0]
    acc[category] = acc[category] || []
    acc[category].push(p)
    return acc
  }, {} as Record<string, ColoredPermission[]>)
})

function handleToggle(id: number, checked: boolean, disabled: boolean = false) {
  if (disabled) return

  const newSelection = checked
    ? [...props.modelValue, id]
    : props.modelValue.filter(pid => pid !== id)
  emit('update:modelValue', newSelection)
}

onMounted(() => permissionStore.fetchAll())
</script>

<template>
  <div class="space-y-8 pr-2 sm:pr-6">
    <div v-if="permissionStore.loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <div class="sticky top-0 bg-card/80 backdrop-blur-sm pt-1 pb-4 z-10 transition-shadow">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="search" :placeholder="t('views.roles.searchPermissions')" class="pl-9 rounded-xl h-10 border-2" />
        </div>
      </div>

    <TooltipProvider :delay-duration="300">
      <div v-for="(perms, category) in groupedPermissions" :key="category" class="space-y-3">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-1">
          {{ formatCategory(category) }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="permission in perms" :key="permission.id"
            class="group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
            :class="[
              modelValue.includes(permission.id)
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-border/40 bg-card hover:border-border hover:bg-muted/30',
              isPermissionDisabled(permission.name) ? 'opacity-50 cursor-not-allowed bg-muted/20 border-border/20 grayscale-[0.5]' : 'cursor-pointer'
            ]" @click="handleToggle(permission.id, !modelValue.includes(permission.id), isPermissionDisabled(permission.name))">

            <div class="relative flex items-center">
              <Checkbox :id="`perm-${permission.id}`" :model-value="modelValue.includes(permission.id)"
                :disabled="isPermissionDisabled(permission.name)"
                class="transition-transform group-active:scale-90" />
              <div v-if="isPermissionDisabled(permission.name)" class="absolute -top-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border/50">
                <Lock class="h-2 w-2 text-muted-foreground" />
              </div>
            </div>

            <component :is="ACTION_CONFIG[permission.actionType].icon" class="h-4 w-4 shrink-0 transition-colors"
              :class="modelValue.includes(permission.id) ? 'text-primary' : 'text-muted-foreground/60'" />

            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <Tooltip>
                <TooltipTrigger as-child>
                  <label :for="`perm-${permission.id}`" @click.stop
                    class="truncate text-sm font-medium leading-tight transition-colors"
                    :class="[
                      modelValue.includes(permission.id) ? 'text-primary' : 'text-foreground/80',
                      isPermissionDisabled(permission.name) ? 'cursor-not-allowed' : 'cursor-pointer'
                    ]">
                    {{ te('permissions.' + permission.name) ? t('permissions.' + permission.name) :
                      permission.name }}
                  </label>
                </TooltipTrigger>
                <TooltipContent side="top" class="bg-foreground text-background font-mono text-[11px] py-1 px-2">
                  <p>
                    {{ te('permissions.' + permission.name) ? t('permissions.' + permission.name) :
                      permission.name }}
                  </p>
                  <p class="text-muted-foreground">
                    {{ permission.name }}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Badge variant="secondary"
              class="h-5 shrink-0 rounded-md border-transparent px-1.5 text-[10px] font-bold uppercase tracking-tighter transition-opacity"
              :class="[
                ACTION_CONFIG[permission.actionType].color,
                modelValue.includes(permission.id) ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
              ]">
              {{ ACTION_CONFIG[permission.actionType].label }}
            </Badge>
          </div>
        </div>
      </div>
      </TooltipProvider>
    </template>
  </div>
</template>
