<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, Trophy, Image } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { venueTournamentRoutes } from '@/plugins/routes'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const venueId = computed(() => Number(route.params.id))
const tournaments = ref<any[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function loadTournaments() {
  loading.value = true
  try {
    const { data } = await venueTournamentRoutes.list(venueId.value, currentPage.value, search.value || undefined)
    tournaments.value = data.data
    lastPage.value = data.meta.last_page
    total.value = data.meta.total
  } catch (e) {
    console.error(e)
    toast.error('Failed to load tournaments')
  } finally {
    loading.value = false
  }
}

async function deleteTournament(id: number) {
  deletingId.value = id
  try {
    await venueTournamentRoutes.delete(id)
    toast.success('Tournament deleted successfully')
    await loadTournaments()
  } catch (e) {
    console.error(e)
    toast.error('Failed to delete tournament')
  } finally {
    deletingId.value = null
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTournaments()
  }, 400)
})

watch(venueId, loadTournaments, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.myTournaments.list.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.myTournaments.list.subtitle') }}</p>
      </div>
      <Button v-if="authStore.canAccess('venue-tournament.create')"
        @click="router.push({ name: 'my-venue-tournament-create', params: { id: venueId } })" class="w-full sm:w-auto">
        <Plus class="mr-2 h-4 w-4" /> {{ $t('views.myTournaments.list.new') }}
      </Button>
    </div>

    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="search" :placeholder="$t('views.venues.list.searchPlaceholder')" class="pl-9" />
    </div>

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center p-12">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground/50" />
      </div>

      <div v-else-if="tournaments.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Trophy class="h-6 w-6 text-muted-foreground/50" />
        </div>
        <h3 class="text-sm font-semibold">{{ $t('views.myTournaments.list.noTournaments') }}</h3>
        <p class="text-xs text-muted-foreground mt-1 max-w-[250px]">
          {{ $t('views.myTournaments.list.noTournamentsDesc') }}
        </p>
        <Button v-if="authStore.canAccess('venue-tournament.create')" variant="outline" size="sm"
          @click="router.push({ name: 'my-venue-tournament-create', params: { id: venueId } })" class="mt-4">
          {{ $t('views.myTournaments.list.addFirstValue') }}
        </Button>
      </div>

      <Table v-else>
        <TableHeader>
          <TableRow class="bg-muted/30">
            <TableHead class="w-20">{{ $t('views.myTournaments.list.table.picture') }}</TableHead>
            <TableHead>{{ $t('views.myTournaments.list.table.title') }}</TableHead>
            <TableHead>{{ $t('views.myTournaments.list.table.activity') }}</TableHead>
            <TableHead>{{ $t('views.myTournaments.list.table.description') }}</TableHead>
            <TableHead class="text-right">{{ $t('views.myTournaments.list.table.actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="tournament in tournaments" :key="tournament.id" class="hover:bg-muted/20 transition-colors">
            <TableCell>
              <div
                class="h-10 w-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border">
                <img v-if="tournament.picture_url" :src="tournament.picture_url" alt=""
                  class="h-full w-full object-cover" />
                <Image v-else class="h-5 w-5 text-muted-foreground/40" />
              </div>
            </TableCell>
            <TableCell class="font-bold">{{ tournament.title }}</TableCell>
            <TableCell>
              <span v-if="tournament.activity" class="font-medium">{{ tournament.activity.name }}</span>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell class="max-w-xs truncate text-muted-foreground">{{ tournament.description }}</TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button v-if="authStore.canAccess('venue-tournament.update')" variant="ghost" size="sm"
                  @click="router.push({ name: 'my-venue-tournament-edit', params: { id: venueId, tournamentId: tournament.id } })">
                  <Pencil class="h-4 w-4" />
                </Button>

                <AlertDialog v-if="authStore.canAccess('venue-tournament.delete')">
                  <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{ $t('views.myTournaments.list.delete.title') }}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {{ $t('views.myTournaments.list.delete.description', { title: tournament.title }) }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{{ $t('views.myTournaments.list.delete.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction @click="deleteTournament(tournament.id)"
                        class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <Loader2 v-if="deletingId === tournament.id" class="mr-2 h-4 w-4 animate-spin" />
                        {{ $t('views.myTournaments.list.delete.confirm') }}
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

    <div v-if="lastPage > 1" class="flex items-center justify-between text-sm text-muted-foreground">
      <span>{{ $t('views.users.list.pagination.info', { current: currentPage, last: lastPage }) }}</span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="currentPage <= 1" @click="currentPage--; loadTournaments()">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" :disabled="currentPage >= lastPage"
          @click="currentPage++; loadTournaments()">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
