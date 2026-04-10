<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { roleRoutes } from '@/plugins/routes'
import type { RoleModel } from '@/models/RoleModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Shield, Trash2, Edit2, Plus, Loader2, Search, ChevronLeft, ChevronRight, Lock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const roles = ref<RoleModel[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function loadRoles() {
  loading.value = true
  try {
    const { data } = await roleRoutes.list(currentPage.value, search.value || undefined)
    roles.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadRoles()
  }, 400)
})

async function deleteRole(id: number) {
  deletingId.value = id
  try {
    await roleRoutes.delete(id)
    await loadRoles()
  } finally {
    deletingId.value = null
  }
}

onMounted(loadRoles)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Shield class="h-5 w-5 text-primary" />
          {{ $t('views.roles.title') }}
        </h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.roles.subtitle') }}</p>
      </div>
      <Button v-if="authStore.canAccess('role.create')" @click="router.push({ name: 'admin-roles-create' })">
        <Plus class="mr-2 h-4 w-4" /> {{ $t('views.roles.new') }}
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" :placeholder="$t('views.roles.list.searchPlaceholder')" class="pl-9" />
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-12">{{ $t('views.roles.list.table.id') }}</TableHead>
            <TableHead>{{ $t('views.roles.list.table.roleName') }}</TableHead>
            <TableHead>{{ $t('views.roles.list.table.permissions') }}</TableHead>
            <TableHead class="text-right">{{ $t('views.roles.list.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="4" class="py-12 text-center text-muted-foreground">
              <Loader2 class="mx-auto h-6 w-6 animate-spin" />
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!roles.length">
            <TableCell colspan="4" class="py-12 text-center text-muted-foreground text-sm">
              {{ $t('views.roles.list.noRoles') }}
            </TableCell>
          </TableRow>
          <TableRow v-for="role in roles" :key="role.id" class="hover:bg-muted/20 transition-colors">
            <TableCell class="font-mono text-xs text-muted-foreground">{{ role.id }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full bg-primary" />
                <span class="font-bold text-sm uppercase tracking-wider">{{ role.name }}</span>
                <Lock v-if="role.is_locked" class="h-3 w-3 text-muted-foreground/50" />
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1 max-w-md">
                <Badge 
                  v-for="permission in role.permissions" 
                  :key="permission.id" 
                  variant="secondary"
                  class="text-[9px] px-1.5 py-0 font-medium bg-primary/5 text-primary border-primary/10"
                >
                  {{ $te('permissions.' + permission.name) ? $t('permissions.' + permission.name) : permission.name }}
                </Badge>
                <span v-if="!role.permissions?.length" class="text-xs text-muted-foreground italic">
                  {{ $t('views.roles.list.noPermissions') }}
                </span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <div v-if="!role.is_locked" class="flex justify-end gap-2">
                <Button
                  v-if="authStore.canAccess('role.update')"
                  size="sm"
                  variant="ghost"
                  @click="router.push({ name: 'admin-roles-edit', params: { id: role.id } })"
                >
                  <Edit2 class="h-4 w-4" />
                </Button>
                <AlertDialog v-if="authStore.canAccess('role.delete')">
                  <AlertDialogTrigger as-child>
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{ $t('views.roles.list.delete.title') }}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {{ $t('views.roles.list.delete.description', { name: role.name }) }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{ $t('common.actions.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        @click="deleteRole(role.id)">
                        <Loader2 v-if="deletingId === role.id" class="mr-2 h-4 w-4 animate-spin" />
                        {{ $t('common.actions.delete') }}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>{{ $t('views.roles.list.pagination.info', { current: currentPage, last: lastPage, total: total }) }}</span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--; loadRoles()">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage >= lastPage" @click="currentPage++; loadRoles()">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
