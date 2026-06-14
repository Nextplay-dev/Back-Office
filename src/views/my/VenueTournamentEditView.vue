<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { venueTournamentRoutes, activityRoutes, bookingRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, Trophy, Image, Activity, Calendar } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from '@/plugins/dayjs'

const router = useRouter()
const route = useRoute()

const venueId = Number(route.params.id)
const tournamentId = route.params.tournamentId ? Number(route.params.tournamentId) : null
const isEditing = computed(() => !!tournamentId)

const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const errors = ref<Record<string, string[]>>({})
const activities = ref<any[]>([])

const form = ref({
  title: '',
  picture_url: '',
  activity_id: '',
  description: '',
  spot_count: 16
})

const bookingId = ref<number | null>(null)
const existingBooking = ref<any>(null)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const availableSlots = ref<any[]>([])
const selectedSlotIndex = ref<string>('')
const loadingSlots = ref(false)

async function loadData() {
  fetching.value = true
  try {
    const { data: activityData } = await activityRoutes.list(venueId)
    activities.value = activityData

    if (isEditing.value && tournamentId) {
      const { data } = await venueTournamentRoutes.get(tournamentId)
      form.value = {
        title: data.title,
        picture_url: data.picture_url || '',
        activity_id: data.activity_id ? String(data.activity_id) : '',
        description: data.description || '',
        spot_count: data.spot_count !== undefined && data.spot_count !== null ? Number(data.spot_count) : 16
      }
      bookingId.value = data.booking_id
      existingBooking.value = data.booking
    }
  } catch (err: any) {
    error.value = 'Failed to load data'
    toast.error(error.value)
  } finally {
    fetching.value = false
  }
}

async function fetchSlots() {
  if (!form.value.activity_id || !selectedDate.value) {
    availableSlots.value = []
    selectedSlotIndex.value = ''
    return
  }
  loadingSlots.value = true
  try {
    const from = dayjs(selectedDate.value).startOf('day').toISOString()
    const to = dayjs(selectedDate.value).endOf('day').toISOString()
    const { data } = await bookingRoutes.availableSlots(venueId, Number(form.value.activity_id), from, to)
    availableSlots.value = data
    selectedSlotIndex.value = ''
  } catch (err) {
    console.error(err)
  } finally {
    loadingSlots.value = false
  }
}

watch([selectedDate, () => form.value.activity_id], fetchSlots)

async function handleSubmit() {
  loading.value = true
  error.value = null
  errors.value = {}

  let finalBookingId = bookingId.value

  if (selectedSlotIndex.value !== '') {
    const slot = availableSlots.value[Number(selectedSlotIndex.value)]
    if (slot && slot.resources_id && slot.resources_id.length > 0) {
      try {
        const bookingPayload = {
          resource_id: slot.resources_id[0],
          activity_id: Number(form.value.activity_id),
          start_at: slot.start_at,
          end_at: slot.end_at,
          units: 1
        }
        const { data: newBooking } = await bookingRoutes.create(bookingPayload)
        finalBookingId = newBooking.id
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Failed to create booking'
        toast.error(error.value)
        loading.value = false
        return
      }
    }
  }

  const payload = {
    title: form.value.title,
    picture_url: form.value.picture_url || null,
    activity_id: form.value.activity_id ? Number(form.value.activity_id) : null,
    description: form.value.description || null,
    booking_id: finalBookingId,
    spot_count: form.value.spot_count ? Number(form.value.spot_count) : null
  }

  try {
    if (isEditing.value && tournamentId) {
      await venueTournamentRoutes.update(tournamentId, payload)
      toast.success('Tournament updated successfully')
    } else {
      await venueTournamentRoutes.create(venueId, payload)
      toast.success('Tournament created successfully')
    }
    router.push({ name: 'my-venue-tournaments', params: { id: venueId } })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save tournament'
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
    toast.error('Please check the form for errors')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon"
        @click="router.push({ name: 'my-venue-tournaments', params: { id: venueId } })">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">
          {{ isEditing ? $t('views.myTournaments.form.editSubtitle') : $t('views.myTournaments.form.newSubtitle') }}
        </h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.myTournaments.form.subtitle') }}</p>
      </div>
    </div>

    <div v-if="fetching" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error"
        class="p-4 text-sm rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <Card class="col-span-2 rounded-2xl border-none shadow-sm overflow-hidden flex flex-col pt-0 pb-0">
          <CardHeader class="bg-primary/5 py-6">
            <CardTitle class="text-base flex items-center gap-2">
              <Trophy class="h-4 w-4 text-primary" />
              {{ $t('views.myTournaments.form.title') }}
            </CardTitle>
            <CardDescription>{{ $t('views.myTournaments.form.subtitle') }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 pt-6 flex-1">
            <div class="space-y-2">
              <Label for="title">{{ $t('views.myTournaments.form.name') }}</Label>
              <Input id="title" v-model="form.title" :placeholder="$t('views.myTournaments.form.namePlaceholder')"
                required class="rounded-xl" />
              <p v-if="errors.title" class="text-xs text-destructive">{{ errors.title[0] }}</p>
            </div>

            <div class="space-y-2">
              <Label for="activity">{{ $t('views.myTournaments.form.activity') }}</Label>
              <Select v-model="form.activity_id">
                <SelectTrigger id="activity" class="rounded-xl">
                  <SelectValue :placeholder="$t('views.myTournaments.form.activityPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="act in activities" :key="act.id" :value="String(act.id)">
                    {{ act.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.activity_id" class="text-xs text-destructive">{{ errors.activity_id[0] }}</p>
            </div>

            <div class="space-y-2">
              <Label for="spot_count">Total Capacity (Spots)</Label>
              <Input id="spot_count" type="number" v-model="form.spot_count" placeholder="e.g. 16"
                min="1" required class="rounded-xl" />
              <p v-if="errors.spot_count" class="text-xs text-destructive">{{ errors.spot_count[0] }}</p>
            </div>

            <div v-if="form.activity_id" class="border-t border-border/60 pt-4 space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <Calendar class="h-4 w-4 text-primary" />
                <h3 class="font-bold text-sm">Select Slot Booking</h3>
              </div>

              <div v-if="existingBooking" class="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-1 text-sm">
                <span class="font-semibold text-primary">Current Booking Details:</span>
                <span>Date: {{ dayjs(existingBooking.start_at).format('YYYY-MM-DD') }}</span>
                <span>Time: {{ dayjs(existingBooking.start_at).format('HH:mm') }} - {{ dayjs(existingBooking.end_at).format('HH:mm') }}</span>
                <span v-if="existingBooking.resource" class="text-xs text-muted-foreground">Resource: {{ existingBooking.resource.name }}</span>
                <span class="text-xs text-muted-foreground mt-2 italic">* Select a new slot below to reschedule. Otherwise, the existing booking will be kept.</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="booking_date">Booking Date</Label>
                  <Input id="booking_date" type="date" v-model="selectedDate" class="rounded-xl" />
                </div>

                <div class="space-y-2">
                  <Label for="booking_slot">Available Time Slots</Label>
                  <div v-if="loadingSlots" class="flex items-center h-10 px-3 text-sm text-muted-foreground">
                    <Loader2 class="h-4 w-4 animate-spin mr-2" /> Loading slots...
                  </div>
                  <div v-else-if="availableSlots.length === 0" class="flex items-center h-10 px-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
                    No slots available on this date
                  </div>
                  <Select v-else v-model="selectedSlotIndex">
                    <SelectTrigger id="booking_slot" class="rounded-xl">
                      <SelectValue placeholder="Choose a slot..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="(slot, idx) in availableSlots" :key="idx" :value="String(idx)">
                        {{ dayjs(slot.start_at).format('HH:mm') }} - {{ dayjs(slot.end_at).format('HH:mm') }} ({{ slot.resources_id.length }} available)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="picture_url">{{ $t('views.myTournaments.form.picture') }}</Label>
              <Input id="picture_url" v-model="form.picture_url"
                :placeholder="$t('views.myTournaments.form.picturePlaceholder')" class="rounded-xl" />
              <p v-if="errors.picture_url" class="text-xs text-destructive">{{ errors.picture_url[0] }}</p>
            </div>

            <div class="space-y-2">
              <Label for="description">{{ $t('views.myTournaments.form.description') }}</Label>
              <Textarea id="description" v-model="form.description"
                :placeholder="$t('views.myTournaments.form.descriptionPlaceholder')" rows="5"
                class="rounded-xl resize-none" />
              <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description[0] }}</p>
            </div>
          </CardContent>
          <CardFooter class="bg-muted/30 pt-4 flex flex-wrap justify-end gap-3 border-t py-6">
            <Button variant="ghost" type="button" :disabled="loading"
              @click="router.push({ name: 'my-venue-tournaments', params: { id: venueId } })">
              {{ $t('common.actions.cancel') }}
            </Button>
            <Button type="submit" :disabled="loading" class="rounded-xl px-8">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              <Save v-else class="mr-2 h-4 w-4" />
              {{ isEditing ? $t('common.actions.saveChanges') : $t('common.actions.create') }}
            </Button>
          </CardFooter>
        </Card>

        <Card class="rounded-2xl border-none shadow-sm overflow-hidden h-fit">
          <CardHeader>
            <CardTitle class="text-base">Preview</CardTitle>
            <CardDescription>Visual preview of the tournament card</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col items-center">
            <div
              class="w-full aspect-video rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center relative mb-4">
              <img v-if="form.picture_url" :src="form.picture_url" alt="" class="h-full w-full object-cover" />
              <Image v-else class="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div class="w-full space-y-2">
              <h3 class="font-bold text-lg truncate">{{ form.title || 'Tournament Title' }}</h3>
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity class="h-3.5 w-3.5" />
                <span>{{activities.find(a => String(a.id) === form.activity_id)?.name || 'No Activity Selected'
                  }}</span>
              </div>
              <p
                class="text-xs text-muted-foreground line-clamp-3 mt-1 bg-muted/40 p-3 rounded-lg border min-h-[4.5rem]">
                {{ form.description || 'No description provided yet.' }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  </div>
</template>
