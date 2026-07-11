<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { analyticsRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Eye,
} from 'lucide-vue-next'

const stats = ref({ total_events: 0, unique_users: 0 })
const topActions = ref<any[]>([])
const venueClicks = ref<any[]>([])
const venueVisits = ref<any[]>([])
const logs = ref<any[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const totalLogs = ref(0)
const loading = ref(false)
const actionFilter = ref('all')
const selectedLog = ref<any | null>(null)
const isDialogOpen = ref(false)

async function loadAnalytics() {
  loading.value = true
  try {
    const filter = actionFilter.value === 'all' ? undefined : actionFilter.value
    const { data } = await analyticsRoutes.getOverview(currentPage.value, filter)
    stats.value = data.stats
    topActions.value = data.top_actions
    venueClicks.value = data.venue_clicks
    venueVisits.value = data.venue_visits
    logs.value = data.logs.data
    lastPage.value = data.logs.last_page
    totalLogs.value = data.logs.total
  } catch (err) {
    console.error('Failed to load analytics', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function showDetails(log: any) {
  selectedLog.value = log
  isDialogOpen.value = true
}

watch(actionFilter, () => {
  currentPage.value = 1
  loadAnalytics()
})

onMounted(loadAnalytics)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold">{{ $t('views.analytics.title') }}</h2>
      <p class="text-sm text-muted-foreground">{{ $t('views.analytics.subtitle') }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {{ $t('views.analytics.totalEvents') }}
          </CardTitle>
          <Activity class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-black text-foreground">{{ stats.total_events }}</div>
        </CardContent>
      </Card>

      <Card class="border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {{ $t('views.analytics.uniqueUsers') }}
          </CardTitle>
          <Users class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-black text-foreground">{{ stats.unique_users }}</div>
        </CardContent>
      </Card>

      <Card class="border-border/60 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {{ $t('views.analytics.eventDistribution') }}
          </CardTitle>
          <BarChart3 class="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-1.5 mt-1">
            <Badge v-for="act in topActions" :key="act.action" variant="secondary" class="font-mono text-[10px] font-semibold">
              {{ act.action }}: {{ act.count }}
            </Badge>
            <span v-if="!topActions.length" class="text-xs text-muted-foreground">No actions logged yet</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-1 flex flex-col gap-6">
        <Card class="border-border/60 shadow-sm">
          <CardHeader class="bg-muted/10">
            <CardTitle class="text-base font-bold flex items-center gap-2">
              <ExternalLink class="h-4 w-4 text-primary" />
              {{ $t('views.analytics.venueClicks') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/30">
                  <TableHead>{{ $t('views.analytics.venueName') }}</TableHead>
                  <TableHead class="text-right w-24">{{ $t('views.analytics.clicksCount') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="venue in venueClicks" :key="venue.id" class="hover:bg-muted/20">
                  <TableCell class="font-semibold">{{ venue.name }}</TableCell>
                  <TableCell class="text-right font-mono font-bold">{{ venue.clicks_count }}</TableCell>
                </TableRow>
                <TableRow v-if="!venueClicks.length">
                  <TableCell colspan="2" class="text-center py-6 text-xs text-muted-foreground">
                    No clicks recorded yet.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card class="border-border/60 shadow-sm">
          <CardHeader class="bg-muted/10">
            <CardTitle class="text-base font-bold flex items-center gap-2">
              <Eye class="h-4 w-4 text-primary" />
              {{ $t('views.analytics.venueVisits') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow class="bg-muted/30">
                  <TableHead>{{ $t('views.analytics.venueName') }}</TableHead>
                  <TableHead class="text-right w-24">{{ $t('views.analytics.visitsCount') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="venue in venueVisits" :key="venue.id" class="hover:bg-muted/20">
                  <TableCell class="font-semibold">{{ venue.name }}</TableCell>
                  <TableCell class="text-right font-mono font-bold">{{ venue.visits_count }}</TableCell>
                </TableRow>
                <TableRow v-if="!venueVisits.length">
                  <TableCell colspan="2" class="text-center py-6 text-xs text-muted-foreground">
                    No visits recorded yet.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card class="lg:col-span-2 border-border/60 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 bg-muted/10 pb-4">
          <CardTitle class="text-base font-bold">{{ $t('views.analytics.logsTitle') }}</CardTitle>
          <div class="w-48">
            <Select v-model="actionFilter">
              <SelectTrigger class="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{{ $t('views.analytics.filterAll') }}</SelectItem>
                <SelectItem value="venue.click_external_booking">venue.click_external_booking</SelectItem>
                <SelectItem value="venue_visit">venue_visit</SelectItem>
                <SelectItem value="user_registered">user_registered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow class="bg-muted/30">
                <TableHead>{{ $t('views.analytics.table.user') }}</TableHead>
                <TableHead>{{ $t('views.analytics.table.action') }}</TableHead>
                <TableHead>{{ $t('views.analytics.table.date') }}</TableHead>
                <TableHead class="text-right w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading">
                <TableCell colspan="4" class="py-12 text-center">
                  <Loader2 class="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
              <TableRow v-else-if="!logs.length">
                <TableCell colspan="4" class="py-12 text-center text-sm text-muted-foreground">
                  {{ $t('views.analytics.noLogs') }}
                </TableCell>
              </TableRow>
              <TableRow v-for="log in logs" :key="log.id" class="hover:bg-muted/20">
                <TableCell>
                  <div class="flex flex-col">
                    <span class="font-medium text-sm">{{ log.user?.name || 'Unknown' }}</span>
                    <span class="text-xs text-muted-foreground">{{ log.user?.email || '' }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" class="font-mono text-[10px] font-semibold bg-background">
                    {{ log.action }}
                  </Badge>
                </TableCell>
                <TableCell class="text-xs text-muted-foreground">{{ formatDate(log.created_at) }}</TableCell>
                <TableCell class="text-right">
                  <Button size="sm" variant="ghost" class="h-8 w-8 p-0" @click="showDetails(log)">
                    <Eye class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div class="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground">
            <span>Page {{ currentPage }} sur {{ lastPage }} ({{ totalLogs }} logs)</span>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" class="h-7 px-2" :disabled="currentPage <= 1 || loading" @click="currentPage--; loadAnalytics()">
                <ChevronLeft class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" class="h-7 px-2" :disabled="currentPage >= lastPage || loading" @click="currentPage++; loadAnalytics()">
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('views.analytics.detailsTitle') }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 pt-2">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">ID</span>
              <p class="font-mono mt-0.5">{{ selectedLog?.id }}</p>
            </div>
            <div>
              <span class="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">Action</span>
              <p class="font-mono mt-0.5">{{ selectedLog?.action }}</p>
            </div>
            <div class="col-span-2">
              <span class="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">User</span>
              <p class="mt-0.5 font-medium">{{ selectedLog?.user?.name }} ({{ selectedLog?.user?.email }})</p>
            </div>
          </div>
          <div class="space-y-1">
            <span class="font-bold text-muted-foreground uppercase tracking-widest text-[9px]">{{ $t('views.analytics.table.details') }}</span>
            <pre class="p-3 bg-muted border border-border/40 rounded-xl font-mono text-xs overflow-auto max-h-60">{{ JSON.stringify(selectedLog?.metadata || {}, null, 2) }}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
