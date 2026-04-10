<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { activityCategoryRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-vue-next'
import IconSelector from '@/components/IconSelector.vue'

const router = useRouter()

const name = ref('')
const icon = ref('')
const color = ref('#6564DB')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await activityCategoryRoutes.create({
      name: name.value,
      icon: icon.value || null,
      color: color.value || null,
    })
    router.push({ name: 'admin-categories' })
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to create category'
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
        <h2 class="text-xl font-bold">New Category</h2>
        <p class="text-sm text-muted-foreground">Define a new activity category</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Category Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="name">Name *</Label>
            <Input id="name" v-model="name" placeholder="e.g. Football" required />
          </div>

          <div class="space-y-2">
            <Label for="icon">Icon</Label>
            <IconSelector v-model="icon" :color="color" />
            <p class="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Search for icons from Material Design and Ionicons</p>
          </div>

          <div class="space-y-2">
            <Label for="color">Color</Label>
            <div class="flex gap-2">
              <Input id="color" v-model="color" type="color" class="w-12 h-10 p-1" />
              <Input v-model="color" placeholder="#RRGGBB" maxlength="7" />
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
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Create Category
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
