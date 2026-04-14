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
import { useMyVenuesStore } from '@/stores/myVenues'

const myVenuesStore = useMyVenuesStore();
const router = useRouter()

const name = ref('')
const address = ref('')
const media = ref('')
const categoryId = ref<number | null>(null)
const managerIds = ref<number[]>([])
const latitude = ref<string>('')
const longitude = ref<string>('')
const loading = ref(false)
const error = ref('')


async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await venueRoutes.create({
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
        <h2 class="text-xl font-bold">New Venue</h2>
        <p class="text-sm text-muted-foreground">Fill in the details below</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Venue Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" v-model="name" placeholder="e.g. Stade Jean-Bouin" required />
          </div>

          <div class="space-y-2">
            <Label for="address">Address *</Label>
            <Input id="address" v-model="address" placeholder="e.g. 26 Av. du Général Sarrail, Paris" required />
          </div>

          <div class="space-y-2">
            <Label for="category">Category</Label>
            <CategorySelector v-model="categoryId" placeholder="Select a category" />
          </div>

          <div class="space-y-2">
            <Label>Managers</Label>
            <MultiUserSelector v-model="managerIds" />
          </div>

          <div class="space-y-2">
            <Label for="media">Media URL</Label>
            <Input id="media" v-model="media" type="url" placeholder="https://…" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="latitude">Latitude</Label>
              <Input id="latitude" v-model="latitude" type="number" step="any" placeholder="e.g. 48.8566" />
            </div>
            <div class="space-y-2">
              <Label for="longitude">Longitude</Label>
              <Input id="longitude" v-model="longitude" type="number" step="any" placeholder="e.g. 2.3522" />
            </div>
          </div>

          <div v-if="error"
            class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="router.back()">Cancel</Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Create Venue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
