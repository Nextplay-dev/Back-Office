<script setup lang="ts">
import { ref } from 'vue'
import { resourceRoutes } from '@/plugins/routes'
import type { ResourceModel } from '@/models/ResourceModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  resource: ResourceModel
}>()

const { t } = useI18n()
const emit = defineEmits(['updated'])

const submitting = ref(false)
const form = ref({
  name: props.resource.name,
  type: props.resource.type,
  capacity: props.resource.capacity,
})

async function handleSubmit() {
  submitting.value = true
  try {
    await resourceRoutes.update(props.resource.id, form.value)
    toast.success(t('views.myResources.detail.general.save')) // Using the save key as success feedback
    emit('updated')
  } catch (e) {
    toast.error('Failed to update resource')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">{{ $t('views.myResources.detail.general.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="name">{{ $t('views.myResources.detail.general.name') }} *</Label>
          <Input id="name" v-model="form.name" required />
        </div>
        <div class="space-y-2">
          <Label for="type">{{ $t('views.myResources.detail.general.type') }} *</Label>
          <Input id="type" v-model="form.type" required />
        </div>
        <div class="space-y-2">
          <Label for="capacity">{{ $t('views.myResources.detail.general.capacity') }} *</Label>
          <Input id="capacity" type="number" v-model="form.capacity" required />
        </div>
        
        <div class="flex justify-end pt-2">
          <Button type="submit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ $t('views.myResources.detail.general.save') }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
