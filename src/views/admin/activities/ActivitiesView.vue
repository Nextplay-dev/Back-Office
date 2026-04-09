<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { activityRoutes } from '@/plugins/routes'
import type { ActivityModel } from '@/models/ActivityModel'
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
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const activities = ref<ActivityModel[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function loadActivities() {
  loading.value = true
  try {
    const { data } = await activityRoutes.list(currentPage.value, search.value || undefined)
    activities.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

async function deleteActivity(id: number) {
  deletingId.value = id
  try {
    await activityRoutes.delete(id)
    await loadActivities()
  } finally {
    deletingId.value = null
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadActivities()
  }, 400)
})

onMounted(loadActivities)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">Activities</h2>
        <p class="text-sm text-muted-foreground">{{ total }} total</p>
      </div>
      <Button v-if="authStore.canAccess('activity.create')" @click="router.push({ name: 'activities-create' })">
        <Plus class="mr-2 h-4 w-4" /> New Activity
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" placeholder="Search activities…" class="pl-9" />
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead class="text-center">Tournaments</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="py-12 text-center text-muted-foreground">
              <Loader2 class="mx-auto h-6 w-6 animate-spin" />
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!activities.length">
            <TableCell colspan="6" class="py-12 text-center text-muted-foreground text-sm">
              No activities found.
            </TableCell>
          </TableRow>
          <TableRow
            v-for="activity in activities"
            :key="activity.id"
            class="hover:bg-muted/20 transition-colors"
          >
            <TableCell class="font-mono text-xs text-muted-foreground">{{ activity.id }}</TableCell>
            <TableCell class="font-medium">{{ activity.name }}</TableCell>
            <TableCell>
              <Badge
                v-if="activity.category"
                variant="secondary"
                :style="activity.category.color ? { backgroundColor: activity.category.color + '22', color: activity.category.color } : {}"
              >
                {{ activity.category.name }}
              </Badge>
              <span v-else class="text-muted-foreground text-sm">—</span>
            </TableCell>
            <TableCell class="max-w-[200px] truncate text-sm text-muted-foreground">{{ activity.address }}</TableCell>
            <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
              <span v-if="activity.latitude && activity.longitude">
                {{ activity.latitude }}, {{ activity.longitude }}
              </span>
              <span v-else>—</span>
            </TableCell>
            <TableCell class="text-center">
              <Badge variant="outline">{{ activity.tournaments_count }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  v-if="authStore.hasPermission('activity.update')"
                  size="sm"
                  variant="ghost"
                  @click="router.push({ name: 'activities-edit', params: { id: activity.id } })"
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <AlertDialog v-if="authStore.hasPermission('activity.delete')">
                  <AlertDialogTrigger as-child>
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete activity?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{{ activity.name }}" will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        @click="deleteActivity(activity.id)"
                      >
                        <Loader2 v-if="deletingId === activity.id" class="mr-2 h-4 w-4 animate-spin" />
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
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="currentPage--; loadActivities()"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= lastPage"
          @click="currentPage++; loadActivities()"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
