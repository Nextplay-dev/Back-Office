<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resourceRoutes } from '@/plugins/routes'
import type { ResourceModel } from '@/models/ResourceModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ArrowLeft, Settings, Users, Layers, Loader2, ChevronLeft, ChevronRight, Calendar, Clock, User, CreditCard, Activity } from 'lucide-vue-next'
import dayjs from 'dayjs'
import TimeGridCalendar from '@/components/Calendar/TimeGridCalendar.vue'
import { useIntervalFn, useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const resourceId = computed(() => Number(route.params.resourceId))
const venueId = computed(() => Number(route.params.id))

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('md')
const viewDaysCount = computed(() => isMobile.value ? 1 : 3)

const resource = ref<ResourceModel | null>(null)
const bookings = ref<any[]>([])
const loading = ref(true)
const selectedDate = ref(dayjs())

const selectedBooking = ref<any>(null)
const detailDialogOpen = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const [resData, bookData] = await Promise.all([
      resourceRoutes.get(resourceId.value),
      resourceRoutes.bookings(resourceId.value)
    ])
    resource.value = resData.data
    bookings.value = bookData.data
  } catch (e) {
    console.error('Failed to fetch data', e)
  } finally {
    loading.value = false
  }
}

const viewDays = ref<dayjs.Dayjs[]>([])

function generateDays() {
  const days = []
  let current = selectedDate.value.startOf('day')

  for (let i = 0; i < viewDaysCount.value; i++) {
    days.push(current.add(i, 'day'))
  }
  viewDays.value = days
}

function handleBookingClick(booking: any) {
  selectedBooking.value = booking
  detailDialogOpen.value = true
}

function nextDays() {
  selectedDate.value = selectedDate.value.add(viewDaysCount.value, 'days')
  generateDays()
}

function prevDays() {
  selectedDate.value = selectedDate.value.subtract(viewDaysCount.value, 'days')
  generateDays()
}

onMounted(() => {
  fetchData()
  generateDays()
})

watch(() => [route.params.id, route.params.resourceId, viewDaysCount.value], () => {
  fetchData()
  generateDays()
})

useIntervalFn(() => {
  fetchData()
}, 10000)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="sm" @click="router.push({ name: 'my-venue-resources', params: { id: venueId } })">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h2 class="text-2xl font-bold tracking-tight">
            {{ resource?.name || $t('views.myResources.detail.loading') }}
          </h2>
          <p class="text-sm text-muted-foreground">{{ $t('views.myResources.detail.dashboard.title') }}</p>
        </div>
      </div>

      <Button variant="outline" class="w-full md:w-auto gap-2"
        @click="router.push({ name: 'my-resource-edit', params: { id: venueId, resourceId } })">
        <Settings class="h-4 w-4" />
        {{ $t('views.myResources.detail.dashboard.config') }}
      </Button>
    </div>

    <div v-if="loading && !resource" class="flex items-center justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-app-primary" />
    </div>

    <div v-else class="grid gap-6 md:grid-cols-3">
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {{ $t('views.myResources.detail.general.title') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-app-primary/10 flex items-center justify-center text-app-primary">
                <Layers class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <p class="text-xs text-muted-foreground">{{ $t('views.myResources.detail.dashboard.stats.type') }}</p>
                <Badge variant="secondary" class="mt-0.5 capitalize">{{ resource?.type }}</Badge>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                <Users class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <p class="text-xs text-muted-foreground">{{ $t('views.myResources.detail.dashboard.stats.capacity') }}
                </p>
                <p class="font-bold text-lg leading-none">{{ resource?.capacity }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between items-center text-sm">
                <span>Total Bookings</span>
                <span class="font-bold">{{ bookings.length }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="md:col-span-2 space-y-6">
        <Card class="h-full">
          <CardHeader class="flex flex-col md:flex-row md:items-center justify-between pb-4 space-y-4 md:space-y-0">
            <CardTitle class="text-lg font-bold">
              {{ $t('views.myResources.detail.dashboard.calendar.title') }}
            </CardTitle>
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <span class="text-sm font-medium text-muted-foreground bg-muted p-1 px-3 rounded-md text-center">
                {{ selectedDate.format('MMM D') }} {{ viewDaysCount > 1 ? '- ' + selectedDate.add(viewDaysCount - 1,
                  'day').format('MMM D, YYYY') : selectedDate.format('YYYY') }}
              </span>
              <div class="flex items-center justify-center gap-2">
                <div class="flex border rounded-md">
                  <Button variant="ghost" size="icon" class="h-8 w-8 rounded-none border-r" @click="prevDays">
                    <ChevronLeft class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 rounded-none" @click="nextDays">
                    <ChevronRight class="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" @click="selectedDate = dayjs(); generateDays()">
                  {{ $t('views.myResources.detail.dashboard.calendar.today') }}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="p-0">
            <div class="h-[600px] mt-4">
              <TimeGridCalendar :days="viewDays" :bookings="bookings" :start-hour="0" :end-hour="24"
                scroll-to-current-hour @booking-click="handleBookingClick">
                <template #booking="{ booking }">
                  <div class="flex justify-between items-start">
                    <span class="text-[9px] font-bold leading-none">{{ dayjs(booking.start_at).format('HH:mm') }} - {{
                      dayjs(booking.end_at).format('HH:mm') }}</span>
                  </div>
                  <p class="text-[10px] font-bold truncate mt-1">{{ booking.activity?.name || 'Booking' }}</p>
                  <div
                    class="flex items-center gap-1 text-[8px] text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    <Users class="w-2 h-2" />
                    <span>{{ booking.user?.name || 'Private Session' }}</span>
                  </div>
                </template>
              </TimeGridCalendar>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog v-model:open="detailDialogOpen">
      <DialogContent class="sm:max-w-md overflow-hidden p-0 gap-0">
        <DialogHeader class="p-6 pb-0">
          <div class="flex items-center gap-2 mb-2">
            <Badge variant="outline" class="h-6">{{ selectedBooking?.status }}</Badge>
            <Badge v-if="selectedBooking?.payment?.status === 'paid'"
              class="bg-green-100 text-green-700 hover:bg-green-100 h-6 border-none">Paid</Badge>
          </div>
          <DialogTitle class="text-2xl font-bold flex items-center gap-2">
            <Activity class="h-5 w-5 text-app-primary" />
            {{ selectedBooking?.activity?.name || 'Resource Booking' }}
          </DialogTitle>
          <DialogDescription>
            Booking ID: #{{ selectedBooking?.id }}
          </DialogDescription>
        </DialogHeader>

        <div class="p-6 space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Calendar class="h-3 w-3" />
                Date
              </p>
              <p class="text-sm font-semibold">{{ dayjs(selectedBooking?.start_at).format('MMMM D, YYYY') }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Clock class="h-3 w-3" />
                Time Slot
              </p>
              <p class="text-sm font-semibold">{{ dayjs(selectedBooking?.start_at).format('HH:mm') }} - {{
                dayjs(selectedBooking?.end_at).format('HH:mm') }}</p>
            </div>
          </div>

          <div class="space-y-4 pt-4 border-t">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="space-y-0.5">
                <p class="text-[10px] font-bold text-muted-foreground uppercase">Customer</p>
                <p class="text-sm font-semibold">{{ selectedBooking?.user?.name || 'Unknown User' }}</p>
                <p class="text-xs text-muted-foreground">{{ selectedBooking?.user?.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Users class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="space-y-0.5">
                <p class="text-[10px] font-bold text-muted-foreground uppercase">Capacity Used</p>
                <p class="text-sm font-semibold">{{ selectedBooking?.units }} Players / Slots</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <CreditCard class="h-4 w-4 text-muted-foreground" />
              </div>
              <div class="space-y-0.5">
                <p class="text-[10px] font-bold text-muted-foreground uppercase">Revenue</p>
                <p class="text-sm font-semibold">{{ selectedBooking?.payment?.amount ?
                  `${selectedBooking.payment.amount} €`
                  : 'N/A' }}</p>
              </div>
            </div>

            <div v-if="selectedBooking?.guests?.length" class="space-y-3 pt-4 border-t">
              <p class="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Users class="h-3 w-3" />
                Invited Players
              </p>
              <div class="grid gap-2">
                <div v-for="guest in selectedBooking.guests" :key="guest.id" class="flex items-center justify-between bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/10">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 border border-muted-foreground/10">
                      <User class="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p class="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-100">{{ guest.user?.name || guest.email }}</p>
                      <p class="text-[9px] text-muted-foreground leading-none mt-0.5">{{ guest.user ? 'Registered Player' : 'Email Invitation' }}</p>
                    </div>
                  </div>
                  <Badge :class="{
                    'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-950 border-none': guest.status === 'accepted',
                    'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:hover:bg-yellow-950 border-none': guest.status === 'pending',
                    'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-950 border-none': guest.status === 'rejected',
                  }" class="h-5 capitalize text-[9px] font-semibold px-2 py-0">
                    {{ guest.status }}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="p-6 bg-muted/30 border-t">
          <Button variant="outline" class="w-full sm:w-auto" @click="detailDialogOpen = false">Close</Button>
          <Button class="w-full sm:w-auto">Manage Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.flex-1 {
  flex: 1 1 0%;
}
</style>
