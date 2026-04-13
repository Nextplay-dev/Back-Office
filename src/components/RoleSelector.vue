<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/roles'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Shield, ShieldCheck, Lock, Info, ListChecks, Scale, Eye,
  Plus,
  Pencil,
  Trash2,
  Circle,
  ShieldAlert,
  Search,
} from 'lucide-vue-next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { RoleModel } from '@/models/RoleModel'
import { type ActionType } from './PermissionSelector.vue'

interface Props {
  modelValue: string[]
  readonly?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { t, te } = useI18n()
const authStore = useAuthStore()
const roleStore = useRoleStore()
const selectedRole = ref<RoleModel | null>(null)
const isDetailsOpen = ref(false)
const permissionSearch = ref('')

const ACTION_CONFIG: Record<ActionType, { label: string, icon: any, color: string }> = {
  view: { label: 'view', icon: Eye, color: 'text-blue-500 bg-blue-500/10' },
  create: { label: 'create', icon: Plus, color: 'text-green-500 bg-green-500/10' },
  update: { label: 'update', icon: Pencil, color: 'text-amber-500 bg-amber-500/10' },
  delete: { label: 'delete', icon: Trash2, color: 'text-red-500 bg-red-500/10' },
  administration: { label: 'admin', icon: ShieldAlert, color: 'text-indigo-500 bg-indigo-500/10' },
  other: { label: 'action', icon: Circle, color: 'text-slate-400 bg-slate-400/10' },
}

const isRoleEnabled = (role: RoleModel) => {
  const currentUser = authStore.user
  if (!currentUser || props.readonly) return false
  if (currentUser.highest_role_weight <= role.weight) return false
  if (!role.permissions || role.permissions.length === 0) return true
  const userPermissions = currentUser.permissions || []
  return role.permissions.every(permission => userPermissions.includes(permission.name))
}

const isSelected = (roleName: string) => {
  return props.modelValue.includes(roleName)
}

const handleToggle = (roleName: string, checked: boolean, disabled: boolean) => {
  if (disabled) return

  const newRoles = checked
    ? [...props.modelValue, roleName]
    : props.modelValue.filter(role => role !== roleName)

  emit('update:modelValue', newRoles)
}

const openRoleDetails = (role: RoleModel) => {
  selectedRole.value = role
  permissionSearch.value = ''
  isDetailsOpen.value = true
}

const sortedRoles = computed(() => {
  return [...roleStore.roles].sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight
    return a.name.localeCompare(b.name)
  })
})

const getPermissionLabel = (permissionName: string) => {
  return te(`permissions.${permissionName}`) ? t(`permissions.${permissionName}`) : permissionName
}

const filteredPermissions = computed(() => {
  const permissions = selectedRole.value?.permissions || []
  const query = permissionSearch.value.trim().toLowerCase()

  return permissions
    .filter(permission => {
      if (!query) return true
      const rawName = permission.name.toLowerCase()
      const translatedName = getPermissionLabel(permission.name).toLowerCase()
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

onMounted(() => roleStore.fetchRoles())
</script>

<template>
  <div class="space-y-3">
    <TooltipProvider>
      <div class="overflow-hidden rounded-2xl border bg-card">
        <div v-for="role in sortedRoles" :key="role.id" role="button" tabindex="0"
          class="flex w-full items-start gap-4 border-b px-4 py-4 text-left transition-colors last:border-b-0" :class="[
            isSelected(role.name) ? 'bg-primary/5' : 'bg-card hover:bg-muted/40',
            !isRoleEnabled(role) ? 'opacity-70' : ''
          ]" @click="openRoleDetails(role)" @keydown.enter.prevent="openRoleDetails(role)"
          @keydown.space.prevent="openRoleDetails(role)">
          <div class="pt-0.5">
            <Checkbox :id="'role-' + role.id" :model-value="isSelected(role.name)" :disabled="!isRoleEnabled(role)"
              @click.stop
              @update:model-value="value => handleToggle(role.name, Boolean(value), !isRoleEnabled(role))" />
          </div>

          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            :class="isSelected(role.name) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'">
            <ShieldCheck v-if="isSelected(role.name)" class="h-5 w-5" />
            <Shield v-else class="h-5 w-5" />
          </div>

          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold capitalize"
                :class="isSelected(role.name) ? 'text-primary' : 'text-foreground'">
                {{ role.name }}
              </span>
              <Badge variant="secondary" class="h-5 rounded-md px-2 text-[10px] font-semibold uppercase">
                {{ $t('components.roleSelector.weight') }} {{ role.weight }}
              </Badge>
              <Badge v-if="role.is_locked" variant="outline" class="text-[9px] h-5 uppercase tracking-tight opacity-70">
                {{ $t('components.roleSelector.system') }}
              </Badge>
            </div>

            <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{{ $t('components.roleSelector.permissionsIncluded', { count: role.permissions?.length || 0 })
              }}</span>
              <span class="text-muted-foreground/50">•</span>
              <span>{{ $t('components.roleSelector.clickToView') }}</span>
            </div>
          </div>

          <div v-if="!isRoleEnabled(role)" class="flex shrink-0 items-center gap-2 pt-0.5">
            <div class="rounded-full border bg-background p-1">
              <Lock class="h-3 w-3 text-muted-foreground" />
            </div>
            <Tooltip v-if="!readonly">
              <TooltipTrigger as-child>
                <div class="cursor-help text-destructive/70">
                  <Info class="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" class="max-w-55 p-2 text-[11px]">
                <p class="font-semibold">{{ $t('components.roleSelector.unauthorizedTitle') }}</p>
                <p>{{ $t('components.roleSelector.unauthorizedDescription') }}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>

    <Dialog :open="isDetailsOpen" @update:open="isDetailsOpen = $event">
      <DialogContent class="sm:max-w-lg p-0 overflow-hidden gap-0 border-none shadow-2xl">
        <DialogHeader
          class="bg-linear-to-br from-primary/10 via-transparent to-transparent px-4 pb-4 pt-6 sm:px-6 text-left">
          <DialogTitle class="flex items-center gap-3 text-xl font-bold capitalize">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Shield class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <div>{{ selectedRole?.name }}</div>
              <div class="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" class="h-5 rounded-md px-2 text-[10px] font-semibold uppercase">
                  {{ $t('components.roleSelector.weight') }} {{ selectedRole?.weight ?? 0 }}
                </Badge>
                <Badge v-if="selectedRole?.is_locked" variant="outline"
                  class="text-[9px] h-5 uppercase tracking-tight opacity-70">
                  {{ $t('components.roleSelector.system') }}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ $t('components.roleSelector.modalDescription') }}
          </p>
        </DialogHeader>

        <div class="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border bg-muted/30 p-4">
              <div
                class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Scale class="h-3.5 w-3.5" />
                {{ $t('components.roleSelector.weight') }}
              </div>
              <div class="text-2xl font-bold text-foreground">
                {{ selectedRole?.weight ?? 0 }}
              </div>
            </div>

            <div class="rounded-2xl border bg-muted/30 p-4">
              <div
                class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ListChecks class="h-3.5 w-3.5" />
                {{ $t('components.roleSelector.permissions') }}
              </div>
              <div class="text-2xl font-bold text-foreground">
                {{ selectedRole?.permissions?.length || 0 }}
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="text-sm font-semibold">{{ $t('components.roleSelector.includedPermissions') }}</div>

            <div v-if="selectedRole?.permissions?.length" class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="permissionSearch" :placeholder="$t('views.roles.searchPermissions')"
                class="h-10 rounded-xl border-2 pl-9" />
            </div>

            <div v-if="filteredPermissions.length" class="max-h-70 space-y-2 overflow-y-auto pr-1">
              <div v-for="permission in filteredPermissions" :key="permission.id"
                class="flex items-center gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm hover:shadow-md transition-shadow">
                <component :is="ACTION_CONFIG[permission.actionType].icon"
                  class="h-4 w-4 shrink-0 transition-colors text-muted-foreground/60" />
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="truncate text-sm font-medium text-foreground">
                    {{ getPermissionLabel(permission.name) }}
                  </div>
                  <div class="truncate text-[10px] font-mono text-muted-foreground/80">
                    {{ permission.name }}
                  </div>
                </div>
                <Badge variant="secondary"
                  class="h-5 shrink-0 rounded-md border-transparent px-1.5 text-[10px] font-bold uppercase tracking-tighter transition-opacity"
                  :class="[
                    ACTION_CONFIG[permission.actionType].color,
                    'opacity-100'
                  ]">
                  {{ ACTION_CONFIG[permission.actionType].label }}
                </Badge>
              </div>
            </div>

            <div v-else-if="selectedRole?.permissions?.length"
              class="rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {{ $t('components.roleSelector.noPermissionsMatch') }}
            </div>

            <div v-else
              class="rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {{ $t('components.roleSelector.noPermissions') }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end border-t bg-muted/40 px-6 py-4">
          <Button type="button" size="sm" class="rounded-lg" @click="isDetailsOpen = false">
            {{ $t('common.actions.cancel') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
