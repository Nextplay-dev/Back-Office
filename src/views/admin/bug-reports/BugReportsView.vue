<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { bugReportRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Trash2, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-vue-next'

const authStore = useAuthStore()

const search = ref('')
const bugReports = ref<any[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const loading = ref(false)
const deletingId = ref<number | null>(null)

watchDebounced(search, () => {
  currentPage.value = 1
  loadBugReports()
}, { debounce: 300 })

async function loadBugReports() {
  loading.value = true
  try {
    const { data } = await bugReportRoutes.list(currentPage.value, search.value)
    bugReports.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

async function deleteBugReport(id: number) {
  deletingId.value = id
  try {
    await bugReportRoutes.delete(id)
    await loadBugReports()
  } finally {
    deletingId.value = null
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(loadBugReports)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.bugReports.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.bugReports.subtitle', { count: total }) }}</p>
      </div>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input v-model="search" :placeholder="$t('views.bugReports.list.searchPlaceholder')" class="pl-9 h-9" />
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-12">{{ $t('views.bugReports.list.table.id') }}</TableHead>
            <TableHead>{{ $t('views.bugReports.list.table.user') }}</TableHead>
            <TableHead>{{ $t('views.bugReports.list.table.email') }}</TableHead>
            <TableHead>{{ $t('views.bugReports.list.table.message') }}</TableHead>
            <TableHead>{{ $t('views.bugReports.list.table.date') }}</TableHead>
            <TableHead class="text-right">{{ $t('views.bugReports.list.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="py-12 text-center text-muted-foreground">
              <Loader2 class="mx-auto h-6 w-6 animate-spin" />
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!bugReports.length">
            <TableCell colspan="6" class="py-12 text-center text-muted-foreground text-sm">
              {{ $t('views.bugReports.list.noBugReports') }}
            </TableCell>
          </TableRow>
          <TableRow v-for="bug in bugReports" :key="bug.id" class="hover:bg-muted/20 transition-colors">
            <TableCell class="font-mono text-xs text-muted-foreground">{{ bug.id }}</TableCell>
            <TableCell class="font-medium">{{ bug.user?.name || '—' }}</TableCell>
            <TableCell>{{ bug.user?.email || '—' }}</TableCell>
            <TableCell class="max-w-md truncate">{{ bug.message }}</TableCell>
            <TableCell class="text-xs text-muted-foreground">{{ formatDate(bug.created_at) }}</TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <AlertDialog v-if="authStore.canAccess('bug-report.delete')">
                  <AlertDialogTrigger as-child>
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{ $t('views.bugReports.list.delete.title') }}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {{ $t('views.bugReports.list.delete.description', { name: bug.user?.name || 'User' }) }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{ $t('common.actions.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        @click="deleteBugReport(bug.id)">
                        <Loader2 v-if="deletingId === bug.id" class="mr-2 h-4 w-4 animate-spin" />
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
      <span>{{ $t('views.users.list.pagination.info', { current: currentPage, last: lastPage }) }}</span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--; loadBugReports()">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage >= lastPage"
          @click="currentPage++; loadBugReports()">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
