<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { venueRoutes } from '@/plugins/routes'
import type { VenueModel } from '@/models/VenueModel'
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
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, Eye } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const venues = ref<VenueModel[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function loadVenues() {
  loading.value = true
  try {
    const { data } = await venueRoutes.list(currentPage.value, search.value || undefined)
    venues.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } finally {
    loading.value = false
  }
}

async function deleteVenue(id: number) {
  deletingId.value = id
  try {
    await venueRoutes.delete(id)
    await loadVenues()
  } finally {
    deletingId.value = null
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadVenues()
  }, 400)
})

onMounted(loadVenues)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.venues.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.venues.subtitle', { count: total }) }}</p>
      </div>
      <Button v-if="authStore.canAccess('venue.create')" @click="router.push({ name: 'admin-venues-create' })">
        <Plus class="mr-2 h-4 w-4" /> {{ $t('views.venues.new') }}
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" :placeholder="$t('views.venues.list.searchPlaceholder')" class="pl-9" />
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-12">{{ $t('views.venues.list.table.id') }}</TableHead>
            <TableHead>{{ $t('views.venues.list.table.name') }}</TableHead>
            <TableHead>{{ $t('views.venues.list.table.category') }}</TableHead>
            <TableHead>{{ $t('views.venues.list.table.address') }}</TableHead>
            <TableHead>{{ $t('views.venues.list.table.coordinates') }}</TableHead>
            <TableHead class="text-center">{{ $t('views.venues.list.table.tournaments') }}</TableHead>
            <TableHead class="text-right">{{ $t('views.venues.list.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="7" class="py-12 text-center text-muted-foreground">
              <Loader2 class="mx-auto h-6 w-6 animate-spin" />
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!venues.length">
            <TableCell colspan="7" class="py-12 text-center text-muted-foreground text-sm">
              {{ $t('views.venues.list.noVenues') }}
            </TableCell>
          </TableRow>
          <TableRow v-for="venue in venues" :key="venue.id" class="hover:bg-muted/20 transition-colors">
            <TableCell class="font-mono text-xs text-muted-foreground">{{ venue.id }}</TableCell>
            <TableCell class="font-medium">{{ venue.name }}</TableCell>
            <TableCell>
              <Badge v-if="venue.category" variant="secondary"
                :style="venue.category.color ? { backgroundColor: venue.category.color + '22', color: venue.category.color } : {}">
                {{ venue.category.name }}
              </Badge>
              <span v-else class="text-muted-foreground text-sm">—</span>
            </TableCell>
            <TableCell class="max-w-[200px] truncate text-sm text-muted-foreground">{{ venue.address }}</TableCell>
            <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
              <span v-if="venue.latitude && venue.longitude">
                {{ venue.latitude }}, {{ venue.longitude }}
              </span>
              <span v-else>—</span>
            </TableCell>
            <TableCell class="text-center">
              <Badge variant="outline">{{ venue.tournaments_count }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button v-if="authStore.canAccess('venue.update')" size="sm" variant="ghost"
                  @click="router.push({ name: 'admin-venues-edit', params: { id: venue.id } })">
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button v-else size="sm" variant="ghost"
                  @click="router.push({ name: 'admin-venues-edit', params: { id: venue.id } })">
                  <Eye class="h-4 w-4" />
                </Button>
                <AlertDialog v-if="authStore.canAccess('venue.delete')">
                  <AlertDialogTrigger as-child>
                    <Button size="sm" variant="ghost" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{ $t('views.venues.list.delete.title') }}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {{ $t('views.venues.list.delete.description', { name: venue.name }) }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{ $t('common.actions.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        @click="deleteVenue(venue.id)">
                        <Loader2 v-if="deletingId === venue.id" class="mr-2 h-4 w-4 animate-spin" />
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
        <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--; loadVenues()">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage >= lastPage" @click="currentPage++; loadVenues()">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
