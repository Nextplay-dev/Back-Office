<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { exceptionRoutes } from '@/plugins/routes'
import type { ExceptionModel } from '@/models/ExceptionModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Loader2, Calendar, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from '@/plugins/dayjs'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  resourceId: number
}>()

const { t } = useI18n()
const exceptions = ref<ExceptionModel[]>([])
const loading = ref(false)
const dialogOpen = ref(false)
const submitting = ref(false)
const formError = ref<string>('')

const form = ref({
  start_at: dayjs().format('YYYY-MM-DDTHH:mm'),
  end_at: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  type: 'closed' as 'closed' | 'maintenance',
})

const formatDate = (date: string | Date, type: 'date' | 'time' | 'full' = 'full') => {
  const d = dayjs.utc(date).local()
  if (type === 'date') return d.format('LL')
  if (type === 'time') return d.format('LT')
  return d.format('LLL')
}

async function fetchExceptions() {
  loading.value = true
  try {
    const { data } = await exceptionRoutes.list(props.resourceId)
    exceptions.value = data
  } catch (e) {
    console.error('Failed to fetch exceptions', e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = {
    start_at: dayjs().format('YYYY-MM-DDTHH:mm'),
    end_at: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    type: 'closed',
  }
  dialogOpen.value = true
}

async function handleSubmit() {
  submitting.value = true
  try {
    // Send times as UTC to the API
    const payload = {
      ...form.value,
      start_at: dayjs(form.value.start_at).utc().format(),
      end_at: dayjs(form.value.end_at).utc().format(),
    }
    await exceptionRoutes.create(props.resourceId, payload)
    toast.success(t('views.myResources.detail.exceptions.success'))
    dialogOpen.value = false
    await fetchExceptions()
  } catch (e: any) {
    formError.value = e.response.data.message
    toast.error('Failed to add exception')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await exceptionRoutes.delete(id)
    await fetchExceptions()
    toast.success(t('views.myResources.detail.exceptions.removed'))
  } catch (e) {
    toast.error('Failed to remove exception')
  }
}

onMounted(fetchExceptions)
</script>

<template>
  <div class="space-y-6 pt-4">
    <div class="flex justify-end">
      <Button @click="openCreate">
        <Plus class="mr-2 h-4 w-4" />
        {{ $t('views.myResources.detail.exceptions.addClosure') }}
      </Button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4">
      <Loader2 class="h-6 w-6 animate-spin text-muted-foreground/50" />
    </div>

    <div v-else-if="exceptions.length === 0"
      class="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-muted/30">
      <div class="h-12 w-12 rounded-full bg-background border flex items-center justify-center mb-4">
        <Calendar class="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 class="text-sm font-semibold">{{ $t('views.myResources.detail.exceptions.noExceptions') }}</h3>
      <p class="text-xs text-muted-foreground mt-1 max-w-[200px]">{{
        $t('views.myResources.detail.exceptions.noExceptionsDesc') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="exception in exceptions" :key="exception.id"
        class="rounded-xl border shadow-sm overflow-hidden group">
        <div :class="[exception.type === 'closed' ? 'bg-destructive' : 'bg-orange-500']" class="h-1.5 w-full" />
        <CardHeader class="p-5">
          <div class="flex items-center justify-between">
            <Badge :variant="exception.type === 'closed' ? 'destructive' : 'secondary'" class="uppercase text-[10px]">
              {{ $t(`views.myResources.detail.exceptions.types.${exception.type}`) }}
            </Badge>
            <Button @click="handleDelete(exception.id)" variant="ghost" size="sm"
              class="h-8 w-8 text-destructive hover:text-destructive p-0 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
          <CardTitle class="mt-4 flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
              $t('views.myResources.detail.exceptions.start') }}</span>
            <span class="text-base font-bold">{{ formatDate(exception.start_at, 'date') }}</span>
            <span class="text-xs font-medium text-primary">{{ formatDate(exception.start_at, 'time') }}</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="p-5 pt-0 border-t bg-muted/5 mt-2">
          <div class="mt-4 flex flex-col gap-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
              $t('views.myResources.detail.exceptions.end') }}</span>
            <span class="text-base font-bold">{{ formatDate(exception.end_at, 'date') }}</span>
            <span class="text-xs font-medium text-primary">{{ formatDate(exception.end_at, 'time') }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('views.myResources.detail.exceptions.addException') }}</DialogTitle>
          <DialogDescription> {{ $t('views.myResources.detail.exceptions.addExceptionDesc') }} </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
              $t('views.myResources.detail.exceptions.type') }}</Label>
            <Select v-model="form.type">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closed">{{ $t('views.myResources.detail.exceptions.types.closed') }}</SelectItem>
                <SelectItem value="maintenance">{{ $t('views.myResources.detail.exceptions.types.maintenance') }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
                $t('views.myResources.detail.exceptions.start') }}</Label>
              <Input type="datetime-local" v-model="form.start_at" />
            </div>
            <div class="space-y-2">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{{
                $t('views.myResources.detail.exceptions.end') }}</Label>
              <Input type="datetime-local" v-model="form.end_at" />
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
            {{ $t('views.myResources.detail.exceptions.apply') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
