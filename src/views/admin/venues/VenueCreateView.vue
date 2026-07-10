<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { venueRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CategorySelector from '@/components/CategorySelector.vue'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import MultiUserSelector from '@/components/MultiUserSelector.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useMyVenuesStore } from '@/stores/myVenues'

const myVenuesStore = useMyVenuesStore();
const router = useRouter()

const name = ref('')
const address = ref('')
const description = ref('')
const media = ref('')
const categoryId = ref<number | null>(null)
const managerIds = ref<number[]>([])
const latitude = ref<string>('')
const longitude = ref<string>('')
const isVirtual = ref(false)
const externalBookingUrl = ref('')
const loading = ref(false)
const error = ref('')


async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await venueRoutes.create({
      name: name.value,
      address: address.value,
      description: description.value || null,
      venue_category_id: categoryId.value,
      manager_ids: managerIds.value,
      media: media.value || null,
      latitude: latitude.value ? Number(latitude.value) : null,
      longitude: longitude.value ? Number(longitude.value) : null,
      is_virtual: isVirtual.value,
      external_booking_url: isVirtual.value ? (externalBookingUrl.value || null) : null,
    })
    myVenuesStore.fetchVenues(true);
    router.push({ name: 'admin-venues' })
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to create venue'
  } finally {
    loading.value = false
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
        <h2 class="text-xl font-bold">{{ $t('views.venues.new') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.venues.form.newSubtitle') }}</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('views.venues.details') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">{{ $t('views.venues.name') }} *</Label>
            <Input id="name" v-model="name" required />
          </div>

          <div class="space-y-2">
            <Label for="address">{{ $t('views.venues.address') }} *</Label>
            <Input id="address" v-model="address" required />
          </div>

          <div class="space-y-2">
            <Label for="description">{{ $t('views.venues.description') }}</Label>
            <Textarea id="description" v-model="description" />
          </div>

          <div class="space-y-2">
            <Label for="category">{{ $t('views.venues.category') }}</Label>
            <CategorySelector v-model="categoryId" :placeholder="$t('views.venues.categoryPlaceholder')" />
          </div>

          <div class="space-y-2">
            <Label>{{ $t('views.venues.managers') }}</Label>
            <MultiUserSelector v-model="managerIds" />
          </div>

          <div class="space-y-2">
            <Label for="media">{{ $t('views.venues.media') }}</Label>
            <Input id="media" v-model="media" type="url" :placeholder="$t('views.venues.mediaPlaceholder')" />
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <Checkbox id="is_virtual" :checked="isVirtual" @update:checked="isVirtual = ($event === true)" :model-value="isVirtual" @update:model-value="isVirtual = ($event === true)" />
            <Label for="is_virtual" class="cursor-pointer">{{ $t('views.venues.isVirtual') }}</Label>
          </div>

          <div v-if="isVirtual" class="space-y-2">
            <Label for="external_booking_url">{{ $t('views.venues.externalBookingUrl') }}</Label>
            <Input id="external_booking_url" v-model="externalBookingUrl" type="url" placeholder="https://…" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="latitude">{{ $t('views.venues.latitude') }}</Label>
              <Input id="latitude" v-model="latitude" type="number" step="any" :placeholder="$t('views.venues.latitudePlaceholder')" />
            </div>
            <div class="space-y-2">
              <Label for="longitude">{{ $t('views.venues.longitude') }}</Label>
              <Input id="longitude" v-model="longitude" type="number" step="any" :placeholder="$t('views.venues.longitudePlaceholder')" />
            </div>
          </div>

          <div v-if="error"
            class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="router.back()">{{ $t('common.actions.cancel') }}</Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ $t('views.venues.new') }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
