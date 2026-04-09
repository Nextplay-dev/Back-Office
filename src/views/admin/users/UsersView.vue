<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { userRoutes } from '@/plugins/routes'
import type { UserModel } from '@/models/UserModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Search, Trash2, Edit2, Plus, ChevronLeft, ChevronRight, Loader2, Mail } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const users = ref<UserModel[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await userRoutes.list(currentPage.value, search.value || undefined)
    users.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

async function deleteUser(id: number) {
  deletingId.value = id
  try {
    await userRoutes.delete(id)
    await loadUsers()
  } finally {
    deletingId.value = null
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 400)
})

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

onMounted(loadUsers)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">Users</h2>
        <p class="text-sm text-muted-foreground">{{ total }} total users registered</p>
      </div>
      <Button v-if="authStore.canAccess('user.create')" @click="router.push({ name: 'users-create' })">
        <Plus class="mr-2 h-4 w-4" /> New User
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" placeholder="Search users by name or email…" class="pl-9" />
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-12">#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="py-12 text-center text-muted-foreground">
              <Loader2 class="mx-auto h-6 w-6 animate-spin" />
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!users.length">
            <TableCell colspan="6" class="py-12 text-center text-muted-foreground text-sm">
              No users found.
            </TableCell>
          </TableRow>
          <TableRow v-for="user in users" :key="user.id" class="hover:bg-muted/20 transition-colors">
            <TableCell class="font-mono text-xs text-muted-foreground">{{ user.id }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                    {{ getInitials(user.name) }}
                  </AvatarFallback>
                </Avatar>
                <span class="font-medium text-sm">{{ user.name }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail class="h-3 w-3" />
                {{ user.email }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge v-for="role in user.roles || ['user']" :key="role" variant="outline"
                  class="capitalize text-[10px] px-1.5 py-0">
                  {{ role }}
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">
              {{ new Date(user.created_at).toLocaleDateString() }}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  v-if="authStore.canAccess('user.update')"
                  size="sm"
                  variant="ghost"
                  @click="router.push({ name: 'users-edit', params: { id: user.id } })"
                >
                  <Edit2 class="h-4 w-4" />
                </Button>
                <AlertDialog v-if="authStore.canAccess('user.delete')">
                  <AlertDialogTrigger as-child>
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete user?</AlertDialogTitle>
                      <AlertDialogDescription>
                        User "{{ user.name }}" and all their associated data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        @click="deleteUser(user.id)">
                        <Loader2 v-if="deletingId === user.id" class="mr-2 h-4 w-4 animate-spin" />
                        Delete
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
      <span>Page {{ currentPage }} of {{ lastPage }}</span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--; loadUsers()">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage >= lastPage" @click="currentPage++; loadUsers()">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
