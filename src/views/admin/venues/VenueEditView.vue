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
const media = ref('')
const categoryId = ref<number | null>(null)
const managerIds = ref<number[] | undefined>()
const initialManagers = ref<any[]>([])
const latitude = ref<string>('')
const longitude = ref<string>('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')

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
    media.value = venue.media ?? ''
    categoryId.value = venue.category_id ? Number(venue.category_id) : null
    managerIds.value = venue.managers?.map((m: any) => m.id)
    initialManagers.value = venue.managers || []
    latitude.value = venue.latitude ? String(venue.latitude) : ''
    longitude.value = venue.longitude ? String(venue.longitude) : ''
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
      venue_category_id: categoryId.value,
      manager_ids: managerIds.value,
      media: media.value || null,
      latitude: latitude.value ? Number(latitude.value) : null,
      longitude: longitude.value ? Number(longitude.value) : null,
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
            <Label for="category">{{ $t('views.venues.category') }}</Label>
            <CategorySelector v-model="categoryId" :placeholder="$t('views.venues.categoryPlaceholder')"
              :readonly="readonly" />
          </div>

          <div class="space-y-2" v-if="managerIds">
            <Label>{{ $t('views.venues.managers') }}</Label>
            <MultiUserSelector v-model="managerIds" :initial-users="initialManagers" :readonly="!canUpdateManagers" />
          </div>

          <div class="space-y-2">
            <Label for="media">{{ $t('views.venues.media') }}</Label>
            <Input id="media" v-model="media" type="url" :placeholder="$t('views.venues.mediaPlaceholder')"
              :readonly="readonly" />
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
  </div>
</template>
