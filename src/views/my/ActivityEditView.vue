<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activityRoutes, type ActivityPayload } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Loader2, Save, Activity as ActivityIcon, Clock, Layers } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()

const venueId = Number(route.params.id)
const activityId = route.params.activityId ? Number(route.params.activityId) : null
const isEditing = computed(() => !!activityId)

const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const errors = ref<Record<string, string[]>>({})

const form = ref<ActivityPayload>({
  name: '',
  duration_minutes: 60,
  slot_interval_minutes: 30,
  rules_json: {}
})

async function loadData() {
  if (!isEditing.value) {
    fetching.value = false
    return
  }

  fetching.value = true
  try {
    const { data } = await activityRoutes.get(venueId, activityId!)
    form.value = {
      name: data.name,
      duration_minutes: data.duration_minutes,
      slot_interval_minutes: data.slot_interval_minutes,
      rules_json: data.rules || {}
    }
  } catch (err: any) {
    error.value = 'Failed to load activity data'
    toast.error(error.value)
  } finally {
    fetching.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = null
  errors.value = {}

  try {
    if (isEditing.value && activityId) {
      await activityRoutes.update(venueId, activityId, form.value)
      toast.success('Activity updated')
    } else {
      await activityRoutes.create(venueId, form.value)
      toast.success('Activity created')
    }
    router.push({ name: 'my-venue-activities', params: { id: venueId } })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save activity'
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
      <Button variant="ghost" size="icon" @click="router.push({ name: 'my-venue-activities', params: { id: venueId } })">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">{{ isEditing ? $t('common.actions.edit') : $t('views.myActivities.list.new') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('views.myActivities.form.subtitle') }}</p>
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card class="rounded-2xl border-none shadow-sm overflow-hidden min-h-[400px] flex flex-col pt-0 pb-0">
          <CardHeader class="bg-primary/5 py-6">
            <CardTitle class="text-base flex items-center gap-2">
              <ActivityIcon class="h-4 w-4 text-primary" />
              {{ $t('views.myActivities.form.details') }}
            </CardTitle>
            <CardDescription>{{ $t('views.myActivities.form.detailsSubtitle') }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4 pt-6 flex-1">
            <div class="space-y-2">
              <Label for="name">{{ $t('views.myActivities.form.name') }}</Label>
              <Input id="name" v-model="form.name" :placeholder="$t('views.myActivities.form.namePlaceholder')" required class="rounded-xl" />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
            </div>
            
            <div class="space-y-2 pt-2">
              <Label class="flex items-center gap-2">
                <Clock class="h-3.5 w-3.5 text-muted-foreground" />
                {{ $t('views.myActivities.form.duration') }}
              </Label>
              <Input id="duration" type="number" v-model.number="form.duration_minutes" required class="rounded-xl" />
              <p v-if="errors.duration_minutes" class="text-xs text-destructive">{{ errors.duration_minutes[0] }}</p>
            </div>

            <div class="space-y-2 pt-2">
              <Label class="flex items-center gap-2">
                <Layers class="h-3.5 w-3.5 text-muted-foreground" />
                {{ $t('views.myActivities.form.interval') }}
              </Label>
              <Input id="interval" type="number" v-model.number="form.slot_interval_minutes" required class="rounded-xl" />
              <p v-if="errors.slot_interval_minutes" class="text-xs text-destructive">{{ errors.slot_interval_minutes[0] }}</p>
            </div>
          </CardContent>
          <CardFooter class="bg-muted/30 pt-4 flex flex-wrap justify-end gap-3 border-t py-6">
            <Button variant="ghost" type="button" :disabled="loading" @click="router.push({ name: 'my-venue-activities', params: { id: venueId } })">
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
             <CardTitle class="text-base">{{ $t('views.myActivities.form.rules') }}</CardTitle>
             <CardDescription>{{ $t('views.myActivities.form.rulesSubtitle') }}</CardDescription>
           </CardHeader>
           <CardContent>
             <div class="p-8 rounded-xl bg-muted/50 border border-dashed flex flex-col items-center text-center">
                <div class="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ActivityIcon class="h-5 w-5 text-muted-foreground" />
                </div>
                <p class="text-sm font-medium">Coming Soon</p>
                <p class="text-xs text-muted-foreground mt-1">Advanced booking rules and constraints will be available in future updates.</p>
             </div>
           </CardContent>
        </Card>
      </div>
    </form>
  </div>
</template>
