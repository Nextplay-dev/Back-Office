<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { availabilityRoutes } from '@/plugins/routes'
import type { AvailabilityModel } from '@/models/AvailabilityModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from '@/plugins/dayjs'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  resourceId: number
}>()

const { t } = useI18n()
const availabilities = ref<AvailabilityModel[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const submitting = ref(false)
const formError = ref<string>('')

const form = ref({
  day_of_week: 1,
  start_time: '09:00',
  end_time: '18:00',
})

async function fetchAvailabilities() {
  loading.value = true
  try {
    const { data } = await availabilityRoutes.list(props.resourceId)
    availabilities.value = data
  } catch (e) {
    console.error('Failed to fetch availabilities', e)
  } finally {
    loading.value = false
  }
}

function openCreate(dayIndex?: number) {
  form.value = {
    day_of_week: dayIndex ?? 1,
    start_time: '09:00',
    end_time: '18:00',
  }
  dialogOpen.value = true
}

async function handleSubmit() {
  submitting.value = true
  try {
    const [startH, startM] = form.value.start_time.split(':').map(Number)
    const [endH, endM] = form.value.end_time.split(':').map(Number)

    const startObj = dayjs().day(form.value.day_of_week).hour(startH).minute(startM).second(0)
    const endObj = dayjs().day(form.value.day_of_week).hour(endH).minute(endM).second(0)

    const utcStart = startObj.utc()
    const utcEnd = endObj.utc()

    const payload = {
      day_of_week: utcStart.day(),
      start_time: utcStart.format('HH:mm'),
      end_time: utcEnd.format('HH:mm'),
    }

    await availabilityRoutes.create(props.resourceId, payload)
    toast.success(t('views.myResources.detail.availability.success'))
    dialogOpen.value = false
    await fetchAvailabilities()
  } catch (e: any) {
    formError.value = e.response.data.message
    toast.error('Failed to add availability')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await availabilityRoutes.delete(id)
    await fetchAvailabilities()
    toast.success(t('views.myResources.detail.availability.removeWindow'))
  } catch (e) {
    toast.error('Failed to remove window')
  }
}

function getAvailabilitiesForDay(dayIndex: number) {
  return availabilities.value
    .map(avail => {
      const [h, m] = avail.start_time.split(':').map(Number)
      const [eh, em] = avail.end_time.split(':').map(Number)

      const utcStart = dayjs.utc().day(avail.day_of_week).hour(h).minute(m).second(0)
      const utcEnd = dayjs.utc().day(avail.day_of_week).hour(eh).minute(em).second(0)

      const localStart = utcStart.local()
      const localEnd = utcEnd.local()

      return {
        ...avail,
        display_day: localStart.day(),
        display_start: localStart.format('HH:mm'),
        display_end: localEnd.format('HH:mm')
      }
    })
    .filter(a => a.display_day === dayIndex)
    .sort((a, b) => a.display_start.localeCompare(b.display_start))
}

onMounted(fetchAvailabilities)
</script>

<template>
  <div class="space-y-6 pt-4">
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4">
      <Loader2 class="h-6 w-6 animate-spin text-muted-foreground/50" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
      <Card v-for="index in 7" :key="index - 1" class="rounded-xl border shadow-sm flex flex-col"
        :class="[getAvailabilitiesForDay(index - 1).length > 0 ? '' : 'bg-muted/30 opacity-60']">
        <CardHeader class="p-3 border-b bg-muted/10">
          <CardTitle class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
            {{ $t('common.days.' + (index - 1)) }}
          </CardTitle>
        </CardHeader>
        <CardContent class="p-3 flex-1 space-y-2">
          <div class="space-y-1.5">
            <div v-for="avail in getAvailabilitiesForDay(index - 1)" :key="avail.id"
              class="group relative p-2 rounded-lg bg-primary/5 border border-primary/10 flex flex-col gap-0.5">
              <span class="text-[11px] font-bold text-primary">{{ avail.display_start }}</span>
              <span class="text-[11px] font-bold text-primary">{{ avail.display_end }}</span>
              <button @click="handleDelete(avail.id)"
                class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 text-destructive transition-all flex items-center justify-center hover:bg-destructive hover:text-white">
                <Trash2 class="h-3 w-3" />
              </button>
            </div>

            <Button variant="ghost" size="sm" @click="openCreate(index - 1)"
              class="w-full h-8 border border-dashed border-border text-muted-foreground hover:text-primary rounded-lg text-[10px] font-bold p-0">
              <Plus class="h-3 w-3 mr-1" />
              {{ $t('views.myResources.detail.availability.add') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{{ $t('views.myResources.detail.availability.addWindow') }}</DialogTitle>
          <DialogDescription>
            {{ $t('views.myResources.detail.availability.addWindowDesc', { day: $t('common.days.' + form.day_of_week) })
            }}
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
                $t('views.myResources.detail.availability.startTime') }}</Label>
              <Input type="time" v-model="form.start_time" class="font-bold" />
            </div>
            <div class="space-y-2">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
                $t('views.myResources.detail.availability.endTime') }}</Label>
              <Input type="time" v-model="form.end_time" class="font-bold" />
            </div>
          </div>
        </div>

        <div v-if="formError"
          class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle class="h-4 w-4 shrink-0" />
          {{ formError }}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="dialogOpen = false">{{ $t('common.actions.cancel') }}</Button>
          <Button type="submit" @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('views.myResources.detail.availability.addWindow') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
