<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { venueRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CategorySelector from '@/components/CategorySelector.vue'
import MultiUserSelector from '@/components/MultiUserSelector.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useMyVenuesStore } from '@/stores/myVenues'

const authStore = useAuthStore();
const myVenuesStore = useMyVenuesStore();
const router = useRouter()
const route = useRoute()
const venueId = Number(route.params.id)

const name = ref('')
const address = ref('')
const description = ref('')
const media = ref('')
const phone = ref('')
const website = ref('')
const categoryId = ref<number | null>(null)
const managerIds = ref<number[] | undefined>()
const initialManagers = ref<any[]>([])
const latitude = ref<string>('')
const longitude = ref<string>('')
const isVirtual = ref(false)
const externalBookingUrl = ref('')
const externalBookingClicksCount = ref(0)
const visitsCount = ref(0)
const openingHours = ref<{ day_of_week: number; opens_at: string; closes_at: string }[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function addHourSlot() {
  openingHours.value.push({ day_of_week: 0, opens_at: '09:00:00', closes_at: '18:00:00' })
}

function removeHourSlot(index: number) {
  openingHours.value.splice(index, 1)
}

const dayOfWeekMap = [6, 0, 1, 2, 3, 4, 5]

function isTimeInSlot(time: string, opensAt: string, closesAt: string): boolean {
  if (opensAt <= closesAt) {
    return time >= opensAt && time <= closesAt
  }
  return time >= opensAt
}

function currentSlotIndex(): number {
  const now = new Date()
  const jsDay = now.getDay()
  const currentDay = dayOfWeekMap[jsDay]
  const currentTime = now.toTimeString().slice(0, 8)

  const idx = openingHours.value.findIndex(
    s => s.day_of_week === currentDay && isTimeInSlot(currentTime, s.opens_at, s.closes_at)
  )
  if (idx !== -1) return idx

  const yesterdayDay = (currentDay + 6) % 7
  return openingHours.value.findIndex(
    s => s.day_of_week === yesterdayDay && s.opens_at > s.closes_at && currentTime <= s.closes_at
  )
}

function nextOpeningText(): string {
  const now = new Date()
  const jsDay = now.getDay()
  const currentDay = dayOfWeekMap[jsDay]
  const currentTime = now.toTimeString().slice(0, 8)
  for (let offset = 0; offset < 7; offset++) {
    const checkDay = (currentDay + offset) % 7
    const slots = openingHours.value.filter(s => s.day_of_week === checkDay && (offset > 0 || s.opens_at > currentTime))
    if (slots.length) {
      const earliest = slots.reduce((a, b) => a.opens_at < b.opens_at ? a : b)
      return `${dayLabels[checkDay]} ${earliest.opens_at.slice(0, 5)}`
    }
  }
  return ''
}

const sortedOpeningHours = computed(() => {
  return [...openingHours.value].sort((a, b) => a.day_of_week - b.day_of_week)
})

const groupedOpeningHours = computed(() => {
  const groups: { day: number; slots: { opens_at: string; closes_at: string }[] }[] = []
  for (const slot of sortedOpeningHours.value) {
    const existing = groups.find(g => g.day === slot.day_of_week)
    if (existing) {
      existing.slots.push({ opens_at: slot.opens_at, closes_at: slot.closes_at })
    } else {
      groups.push({ day: slot.day_of_week, slots: [{ opens_at: slot.opens_at, closes_at: slot.closes_at }] })
    }
  }
  return groups
})

const venueStatus = computed(() => {
  if (!openingHours.value.length) return null
  const idx = currentSlotIndex()
  if (idx !== -1) {
    return { open: true, text: `Open until ${openingHours.value[idx].closes_at.slice(0, 5)}` }
  }
  return { open: false, text: `Closed, opens ${nextOpeningText()}` }
})

const readonly = computed(() => {
  return !authStore.hasPermission('venue.update')
})

const canUpdateManagers = computed(() => {
  return authStore.hasPermission('venue.managers.update')
})

onMounted(async () => {
  loading.value = true
  try {
    const { data: venue } = await venueRoutes.get(venueId)
    name.value = venue.name
    address.value = venue.address
    description.value = venue.description ?? ''
    media.value = venue.media ?? ''
    phone.value = venue.phone ?? ''
    website.value = venue.website ?? ''
    categoryId.value = venue.category_id ? Number(venue.category_id) : null
    managerIds.value = venue.managers?.map((m: any) => m.id)
    initialManagers.value = venue.managers || []
    latitude.value = venue.latitude ? String(venue.latitude) : ''
    longitude.value = venue.longitude ? String(venue.longitude) : ''
    isVirtual.value = venue.is_virtual ?? false
    externalBookingUrl.value = venue.external_booking_url ?? ''
    externalBookingClicksCount.value = venue.external_booking_clicks_count ?? 0
    visitsCount.value = venue.visits_count ?? 0
    openingHours.value = (venue.opening_hours || []).map(h => ({ day_of_week: h.day_of_week, opens_at: h.opens_at, closes_at: h.closes_at }))
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await venueRoutes.update(venueId, {
      name: name.value,
      address: address.value,
      description: description.value || null,
      category_id: categoryId.value,
      manager_ids: managerIds.value,
      media: media.value || null,
      phone: phone.value || null,
      website: website.value || null,
      latitude: latitude.value ? Number(latitude.value) : null,
      longitude: longitude.value ? Number(longitude.value) : null,
      is_virtual: isVirtual.value,
      external_booking_url: isVirtual.value ? (externalBookingUrl.value || null) : null,
      opening_hours: openingHours.value.length > 0 ? openingHours.value : undefined,
    })
    myVenuesStore.fetchVenues(true);
    router.push({ name: 'admin-venues' })
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to update venue'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" @click="router.back()">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.venues.edit') }}</h2>
        <p class="text-sm text-muted-foreground">#{{ venueId }}</p>
        <div v-if="venueStatus" class="mt-2">
          <span v-if="venueStatus.open"
            class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
            {{ venueStatus.text }}
          </span>
          <span v-else
            class="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            <span class="h-1.5 w-1.5 rounded-full bg-red-500" />
            {{ venueStatus.text }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('views.venues.details') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">{{ $t('views.venues.name') }} *</Label>
            <Input id="name" v-model="name" required :readonly="readonly" />
          </div>

          <div class="space-y-2">
            <Label for="address">{{ $t('views.venues.address') }} *</Label>
            <Input id="address" v-model="address" required :readonly="readonly" />
          </div>

          <div class="space-y-2">
            <Label for="description">{{ $t('views.venues.description') }}</Label>
            <Textarea id="description" v-model="description" :readonly="readonly" />
          </div>

          <div class="space-y-2">
            <Label for="category">{{ $t('views.venues.category') }}</Label>
            <CategorySelector v-model="categoryId" :placeholder="$t('views.venues.categoryPlaceholder')"
              :readonly="readonly" />
          </div>

          <div class="space-y-2" v-if="managerIds">
            <Label>{{ $t('views.venues.managers') }}</Label>
            <MultiUserSelector v-model="managerIds" :initial-users="initialManagers" :readonly="!canUpdateManagers" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="phone">{{ $t('views.venues.phone') }}</Label>
              <Input id="phone" v-model="phone" type="tel" placeholder="+33 1 23 45 67 89" :readonly="readonly" />
            </div>
            <div class="space-y-2">
              <Label for="website">{{ $t('views.venues.website') }}</Label>
              <Input id="website" v-model="website" type="url" placeholder="https://…" :readonly="readonly" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="media">{{ $t('views.venues.media') }}</Label>
            <Input id="media" v-model="media" type="url" :placeholder="$t('views.venues.mediaPlaceholder')"
              :readonly="readonly" />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <Label>{{ $t('views.venues.openingHours') }}</Label>
              <Button v-if="!readonly" type="button" variant="outline" size="sm" @click="addHourSlot">
                {{ $t('views.venues.addSlot') }}
              </Button>
            </div>
            <div v-for="(slot, index) in openingHours" :key="index" class="flex items-end gap-2">
              <div class="flex-1 space-y-1">
                <Label class="text-xs">{{ $t('views.venues.day') }}</Label>
                <select v-model="slot.day_of_week" :disabled="readonly"
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
                  <option v-for="(label, d) in dayLabels" :key="d" :value="d">{{ label }}</option>
                </select>
              </div>
              <div class="flex-1 space-y-1">
                <Label class="text-xs">{{ $t('views.venues.opensAt') }}</Label>
                <Input v-model="slot.opens_at" type="time" step="1" :readonly="readonly" />
              </div>
              <div class="flex-1 space-y-1">
                <Label class="text-xs">{{ $t('views.venues.closesAt') }}</Label>
                <Input v-model="slot.closes_at" type="time" step="1" :readonly="readonly" />
              </div>
              <Button v-if="!readonly" type="button" variant="ghost" size="sm" class="mb-0.5"
                @click="removeHourSlot(index)">×</Button>
            </div>
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <Checkbox id="is_virtual" :checked="isVirtual" @update:checked="isVirtual = ($event === true)"
              :model-value="isVirtual" @update:model-value="isVirtual = ($event === true)" :disabled="readonly" />
            <Label for="is_virtual" class="cursor-pointer">{{ $t('views.venues.isVirtual') }}</Label>
          </div>

          <div v-if="isVirtual" class="space-y-2">
            <Label for="external_booking_url">{{ $t('views.venues.externalBookingUrl') }}</Label>
            <Input id="external_booking_url" v-model="externalBookingUrl" type="url" placeholder="https://…"
              :readonly="readonly" required />
          </div>

          <div v-if="isVirtual" class="space-y-2">
            <Label>{{ $t('views.venues.externalBookingClicks') }}</Label>
            <div class="text-sm font-semibold py-2 px-3 bg-muted/40 border border-border/60 rounded-lg inline-block">
              {{ externalBookingClicksCount }} clicks
            </div>
          </div>

          <div class="space-y-2">
            <Label>{{ $t('views.venues.visitsCount') }}</Label>
            <div class="text-sm font-semibold py-2 px-3 bg-muted/40 border border-border/60 rounded-lg inline-block">
              {{ visitsCount }} visits
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="latitude">{{ $t('views.venues.latitude') }}</Label>
              <Input id="latitude" v-model="latitude" type="number" step="any"
                :placeholder="$t('views.venues.latitudePlaceholder')" :readonly="readonly" />
            </div>
            <div class="space-y-2">
              <Label for="longitude">{{ $t('views.venues.longitude') }}</Label>
              <Input id="longitude" v-model="longitude" type="number" step="any"
                :placeholder="$t('views.venues.longitudePlaceholder')" :readonly="readonly" />
            </div>
          </div>

          <div v-if="error"
            class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

          <div v-if="!readonly" class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="router.back()">{{ $t('common.actions.cancel') }}</Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              {{ $t('common.actions.saveChanges') }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <Card v-if="!loading && groupedOpeningHours.length" class="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle class="text-base">{{ $t('views.venues.openingHours') }}</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <div class="divide-y divide-border/30">
          <div v-for="group in groupedOpeningHours" :key="group.day" class="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20">
            <span class="font-semibold text-sm">{{ dayLabels[group.day] }}</span>
            <div class="flex flex-col items-end gap-0.5">
              <div v-for="(slot, si) in group.slots" :key="si" class="font-mono text-xs text-muted-foreground">
                {{ slot.opens_at.slice(0, 5) }} — {{ slot.closes_at.slice(0, 5) }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
