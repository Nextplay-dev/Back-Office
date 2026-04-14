<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { categoryRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import IconSelector from '@/components/IconSelector.vue'
import { useMyVenuesStore } from '@/stores/myVenues'

const myVenuesStore = useMyVenuesStore();
const router = useRouter()
const route = useRoute()
const categoryId = Number(route.params.id)

const name = ref('')
const icon = ref('')
const color = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await categoryRoutes.get(categoryId)
    name.value = data.name
    icon.value = data.icon ?? ''
    color.value = data.color ?? '#6564DB'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await categoryRoutes.update(categoryId, {
      name: name.value,
      icon: icon.value || null,
      color: color.value || null,
    })
    myVenuesStore.fetchVenues(true);
    router.push({ name: 'admin-categories' })
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to update category'
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
        <h2 class="text-xl font-bold">{{ $t('views.categories.edit') }}</h2>
        <p class="text-sm text-muted-foreground">#{{ categoryId }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <Card v-else>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('views.categories.details') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">{{ $t('views.categories.name') }} *</Label>
            <Input id="name" v-model="name" required />
          </div>

          <div class="space-y-2">
            <Label for="icon">{{ $t('views.categories.icon') }}</Label>
            <IconSelector v-model="icon" :color="color" />
            <p class="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{{
              $t('views.categories.iconHelp') }}</p>
          </div>

          <div class="space-y-2">
            <Label for="color">{{ $t('views.categories.color') }}</Label>
            <div class="flex gap-2">
              <Input id="color" v-model="color" type="color" class="w-12 h-10 p-1" />
              <Input v-model="color" placeholder="#RRGGBB" maxlength="7" />
            </div>
          </div>

          <div v-if="error"
            class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle class="h-4 w-4 shrink-0" />
            {{ error }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
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
