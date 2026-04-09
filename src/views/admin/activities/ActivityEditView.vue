<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activityRoutes, activityCategoryRoutes } from '@/plugins/routes'
import type { ActivityCategoryModel } from '@/models/ActivityCategoryModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const activityId = Number(route.params.id)

const name = ref('')
const address = ref('')
const media = ref('')
const categoryId = ref<string>('')
const latitude = ref<string>('')
const longitude = ref<string>('')
const categories = ref<ActivityCategoryModel[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const [activityRes, categoriesRes] = await Promise.all([
      activityRoutes.get(activityId),
      activityCategoryRoutes.list(1),
    ])
    const activity = activityRes.data
    name.value = activity.name
    address.value = activity.address
    media.value = activity.media ?? ''
    categoryId.value = activity.category_id ? String(activity.category_id) : ''
    latitude.value = activity.latitude ? String(activity.latitude) : ''
    longitude.value = activity.longitude ? String(activity.longitude) : ''
    categories.value = categoriesRes.data.data
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await activityRoutes.update(activityId, {
      name: name.value,
      address: address.value,
      activity_category_id: categoryId.value ? Number(categoryId.value) : null,
      media: media.value || null,
      latitude: latitude.value ? Number(latitude.value) : null,
      longitude: longitude.value ? Number(longitude.value) : null,
    })
    router.push({ name: 'activities' })
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to update activity'
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
        <h2 class="text-xl font-bold">Edit Activity</h2>
        <p class="text-sm text-muted-foreground">#{{ activityId }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">Activity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" v-model="name" required />
          </div>

          <div class="space-y-2">
            <Label for="address">Address *</Label>
            <Input id="address" v-model="address" required />
          </div>

          <div class="space-y-2">
            <Label for="category">Category</Label>
            <Select v-model="categoryId">
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="String(cat.id)"
                >
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
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

          <div
            v-if="error"
            class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="router.back()">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
