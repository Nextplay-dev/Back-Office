<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activityRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CategorySelector from '@/components/CategorySelector.vue'
import MultiUserSelector from '@/components/MultiUserSelector.vue'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useMyActivitiesStore } from '@/stores/myActivities'

const authStore = useAuthStore();
const myActivitiesStore = useMyActivitiesStore();
const router = useRouter()
const route = useRoute()
const activityId = Number(route.params.id)

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
  return !authStore.hasPermission('activity.update')
})

const canUpdateManagers = computed(() => {
  return authStore.hasPermission('activity.managers.update')
})

onMounted(async () => {
  loading.value = true
  try {
    const { data: activity } = await activityRoutes.get(activityId)
    name.value = activity.name
    address.value = activity.address
    media.value = activity.media ?? ''
    categoryId.value = activity.category_id ? Number(activity.category_id) : null
    managerIds.value = activity.managers?.map((m: any) => m.id)
    initialManagers.value = activity.managers || []
    latitude.value = activity.latitude ? String(activity.latitude) : ''
    longitude.value = activity.longitude ? String(activity.longitude) : ''
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
      activity_category_id: categoryId.value,
      manager_ids: managerIds.value,
      media: media.value || null,
      latitude: latitude.value ? Number(latitude.value) : null,
      longitude: longitude.value ? Number(longitude.value) : null,
    })
    myActivitiesStore.fetchActivities(true);
    router.push({ name: 'admin-activities' })
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
        <h2 class="text-xl font-bold">{{ $t('views.activities.edit') }}</h2>
        <p class="text-sm text-muted-foreground">#{{ activityId }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('views.activities.details') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">{{ $t('views.activities.name') }} *</Label>
            <Input id="name" v-model="name" required :readonly="readonly" />
          </div>

          <div class="space-y-2">
            <Label for="address">{{ $t('views.activities.address') }} *</Label>
            <Input id="address" v-model="address" required :readonly="readonly" />
          </div>

          <div class="space-y-2">
            <Label for="category">{{ $t('views.activities.category') }}</Label>
            <CategorySelector v-model="categoryId" :placeholder="$t('views.activities.categoryPlaceholder')"
              :readonly="readonly" />
          </div>

          <div class="space-y-2" v-if="managerIds">
            <Label>{{ $t('views.activities.managers') }}</Label>
            <MultiUserSelector v-model="managerIds" :initial-users="initialManagers" :readonly="!canUpdateManagers" />
          </div>

          <div class="space-y-2">
            <Label for="media">{{ $t('views.activities.media') }}</Label>
            <Input id="media" v-model="media" type="url" :placeholder="$t('views.activities.mediaPlaceholder')"
              :readonly="readonly" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="latitude">{{ $t('views.activities.latitude') }}</Label>
              <Input id="latitude" v-model="latitude" type="number" step="any"
                :placeholder="$t('views.activities.latitudePlaceholder')" :readonly="readonly" />
            </div>
            <div class="space-y-2">
              <Label for="longitude">{{ $t('views.activities.longitude') }}</Label>
              <Input id="longitude" v-model="longitude" type="number" step="any"
                :placeholder="$t('views.activities.longitudePlaceholder')" :readonly="readonly" />
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
