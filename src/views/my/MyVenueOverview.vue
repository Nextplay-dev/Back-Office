<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { VenueModel } from '@/models/VenueModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CategoryIcon from '@/components/CategoryIcon.vue'
import MapDisplay from '@/components/MapDisplay.vue'
import {
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  Navigation,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CreditCard,
  Users
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { venueRoutes, resourceRoutes } from '@/plugins/routes'
import dayjs from 'dayjs'
import { useIntervalFn, useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import TimeGridCalendar from '@/components/Calendar/TimeGridCalendar.vue'

const route = useRoute()
const venue = ref<VenueModel | null>(null)
const loading = ref(true)

const RESOURCE_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
]
const resources = ref<any[]>([])
const bookings = ref<any[]>([])

const selectedBooking = ref<any>(null)
const detailDialogOpen = ref(false)

function handleBookingClick(booking: any) {
  selectedBooking.value = booking
  detailDialogOpen.value = true
}

const selectedDate = ref(dayjs())
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('md')
const viewDaysCount = computed(() => isMobile.value ? 1 : 3)
const viewDays = ref<dayjs.Dayjs[]>([])

function generateDays() {
  const days = []
  let current = selectedDate.value.startOf('day')

  for (let i = 0; i < viewDaysCount.value; i++) {
    days.push(current.add(i, 'day'))
  }
  viewDays.value = days
}

function nextDays() {
  selectedDate.value = selectedDate.value.add(viewDaysCount.value, 'days')
  generateDays()
}

function prevDays() {
  selectedDate.value = selectedDate.value.subtract(viewDaysCount.value, 'days')
  generateDays()
}

async function fetchVenue(id: number) {
  loading.value = true
  try {
    const { data } = await venueRoutes.get(id)
    venue.value = data

    const resData = await resourceRoutes.list(id)
    resources.value = resData.data.map((r, index) => ({
      ...r,
      color: RESOURCE_COLORS[index % RESOURCE_COLORS.length]
    }))

    const allBookingsPromises = resources.value.map(async (res) => {
      const bookData = await resourceRoutes.bookings(res.id)
      return bookData.data.map(b => ({ ...b, resource: res, color: res.color }))
    })

    const allBookingsArray = await Promise.all(allBookingsPromises)
    bookings.value = allBookingsArray.flat()

  } catch (e) {
    console.error('Failed to fetch venue overview', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVenue(Number(route.params.id))
  generateDays()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchVenue(Number(newId))
  }
})

watch(() => viewDaysCount.value, () => generateDays())

useIntervalFn(() => {
  if (route.params.id) {
    fetchVenue(Number(route.params.id))
  }
}, 30000)

function openInGoogleMaps() {
  if (!venue.value) return
  const { latitude, longitude, address } = venue.value
  const query = latitude && longitude ? `${latitude},${longitude}` : encodeURIComponent(address)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
}
</script>

<style scoped></style>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground font-medium animate-pulse">{{
        $t('views.dashboard.myVenueOverview.loading') }}</p>
    </div>

    <template v-else-if="venue">
      <div class="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[320px] sm:min-h-0 sm:aspect-21/7">
        <img v-if="venue.media" :src="venue.media" class="w-full h-full object-cover opacity-60" alt="Venue Banner" />
        <div v-else
          class="w-full h-full bg-linear-to-br from-primary/20 via-slate-900 to-slate-900 flex items-center justify-center">
          <Activity class="h-20 w-20 text-white/10" />
        </div>

        <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div
          class="absolute bottom-0 left-0 right-0 p-5 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 z-10">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <Badge v-if="venue.category" variant="outline"
                class="bg-white/10 backdrop-blur-md border-white/20 text-white gap-2 px-3 py-1">
                <CategoryIcon :icon="venue.category.icon" :color="venue.category.color" class="h-3.5 w-3.5" />
                {{ venue.category.name }}
              </Badge>
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">{{ venue.name }}</h1>
            <div class="flex items-center gap-2 text-white/70">
              <MapPin class="h-4 w-4" />
              <span class="text-sm sm:text-base font-medium">{{ venue.address }}</span>
            </div>
          </div>

          <Button @click="openInGoogleMaps" size="lg"
            class="w-full sm:w-auto rounded-2xl gap-2 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            <Navigation class="h-5 w-5" />
            {{ $t('views.dashboard.myVenueOverview.navigate') }}
            <ExternalLink class="h-4 w-4 opacity-50" />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="md:col-span-2 rounded-3xl border-none shadow-sm flex flex-col min-h-[600px]">
          <CardHeader
            class="flex flex-col md:flex-row md:items-center justify-between pb-4 space-y-4 md:space-y-0 shrink-0">
            <CardTitle class="text-lg font-bold flex items-center gap-2">
              <Calendar class="h-5 w-5 text-primary" />
              Venue Schedule
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
                  Today
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="p-6 flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pt-0">
            <div class="flex-1 min-h-[500px] h-full">
              <TimeGridCalendar :days="viewDays" :bookings="bookings" :start-hour="6" :end-hour="24"
                scroll-to-current-hour @booking-click="handleBookingClick">
                <template #booking="{ booking }">
                  <div class="flex justify-between items-start">
                    <span class="text-[9px] font-bold leading-none">{{ dayjs(booking.start_at).format('HH:mm') }} - {{
                      dayjs(booking.end_at).format('HH:mm') }}</span>
                  </div>
                  <p class="text-[10px] font-bold truncate mt-1">{{ booking.activity?.name || 'Booking' }}</p>
                  <div class="flex items-center gap-1 text-[8px] text-muted-foreground truncate opacity-80 mt-0.5">
                    <span class="font-semibold">{{ booking.resource?.name }}</span>
                  </div>
                </template>
              </TimeGridCalendar>
            </div>

            <div class="w-full lg:w-48 shrink-0 flex flex-col space-y-3 p-4 bg-muted/20 rounded-xl border">
              <h3 class="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Resources</h3>
              <div v-for="res in resources" :key="res.id" class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: res.color }"></div>
                <span class="text-sm font-medium truncate">{{ res.name }}</span>
              </div>
              <div v-if="!resources.length" class="text-xs text-muted-foreground italic">
                No resources found.
              </div>
            </div>
          </CardContent>
        </Card>


        <Card v-if="venue.latitude !== null && venue.longitude !== null"
          class="rounded-3xl border-none shadow-sm overflow-hidden py-0 gap-0 h-96 flex flex-col">
          <div class="p-6 bg-muted/50 flex items-center justify-between border-b shrink-0">
            <h3 class="font-bold flex items-center gap-2">
              <MapPin class="h-5 w-5 text-primary" />
              {{ $t('views.dashboard.myVenueOverview.location') }}
            </h3>
          </div>
          <CardContent class="p-0 relative z-0 flex-1 min-h-0">
            <MapDisplay :lat="venue.latitude" :lng="venue.longitude" :zoom="12" />
          </CardContent>
        </Card>
      </div>

    </template>

    <Dialog v-model:open="detailDialogOpen">
      <DialogContent class="sm:max-w-md overflow-hidden p-0 gap-0">
        <DialogHeader class="p-6 pb-0">
          <div class="flex items-center gap-2 mb-2">
            <Badge variant="outline" class="h-6">{{ selectedBooking?.status }}</Badge>
            <Badge v-if="selectedBooking?.payment?.status === 'paid'"
              class="bg-green-100 text-green-700 hover:bg-green-100 h-6 border-none">Paid</Badge>
          </div>
          <DialogTitle class="text-2xl font-bold flex items-center gap-2">
            <Activity class="h-5 w-5 text-primary" />
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
