<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { roleRoutes, type RolePayload } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Loader2, Save, Shield } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import PermissionSelector from '@/components/PermissionSelector.vue'

const router = useRouter()
const route = useRoute()

const roleId = route.params.id ? Number(route.params.id) : null
const isEditing = computed(() => !!roleId)

const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const errors = ref<Record<string, string[]>>({})

const form = ref({
  name: '',
  weight: 0,
  selectedPermissionIds: [] as number[]
})

async function loadData() {
  fetching.value = true
  try {
    if (isEditing.value && roleId) {
      const { data: rData } = await roleRoutes.get(roleId)
      form.value.name = rData.name
      form.value.weight = rData.weight
      form.value.selectedPermissionIds = rData.permissions?.map(p => p.id) || []
    }
  } catch (err: any) {
    error.value = 'Failed to load necessary data'
  } finally {
    fetching.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = null
  errors.value = {}

  const payload: RolePayload = {
    name: form.value.name,
    weight: form.value.weight,
    permissions: form.value.selectedPermissionIds
  }

  try {
    if (isEditing.value && roleId) {
      await roleRoutes.update(roleId, payload)
    } else {
      await roleRoutes.create(payload)
    }
    router.push({ name: 'admin-roles' })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save role'
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-8xl space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">{{ isEditing ? $t('views.roles.edit') : $t('views.roles.new') }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ isEditing ? $t('views.roles.form.editSubtitle', { id: roleId }) : $t('views.roles.form.newSubtitle') }}
        </p>
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pb-12">
        <Card class="lg:col-span-1 lg:sticky lg:top-8 h-fit rounded-2xl border-none shadow-sm overflow-hidden py-0">
          <CardHeader class="bg-primary/5 py-6">
            <CardTitle class="text-base flex items-center gap-2">
              <Shield class="h-4 w-4 text-primary" />
              {{ $t('views.roles.details') }}
            </CardTitle>
            <CardDescription>{{ $t('views.roles.detailsSubtitle') }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="name">{{ $t('views.roles.name') }}</Label>
              <Input id="name" v-model="form.name" :placeholder="$t('views.roles.namePlaceholder')" required
                class="rounded-xl" />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="weight">{{ $t('views.roles.form.weight') }}</Label>
              <Input id="weight" type="number" v-model.number="form.weight" min="0" max="100" required
                class="rounded-xl" />
              <p class="text-[10px] text-muted-foreground">{{ $t('views.roles.form.weightHelp') }}</p>
              <p v-if="errors.weight" class="text-xs text-destructive">{{ errors.weight[0] }}</p>
            </div>
          </CardContent>
          <CardFooter class="bg-muted/30 pt-4 flex flex-wrap justify-end gap-3 border-t py-6">
            <Button variant="ghost" type="button" :disabled="loading" @click="router.back()">{{
              $t('common.actions.cancel') }}</Button>
            <Button type="submit" :disabled="loading" class="rounded-xl">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              <Save v-else class="mr-2 h-4 w-4" />
              {{ isEditing ? $t('common.actions.saveChanges') : $t('common.actions.create') }}
            </Button>
          </CardFooter>
        </Card>

        <Card class="lg:col-span-2 rounded-2xl border-none shadow-sm overflow-hidden">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>{{ $t('views.roles.permissions') }}</CardTitle>
                <CardDescription>{{ $t('views.roles.permissionsSubtitle') }}</CardDescription>
              </div>
              <Badge variant="outline" class="rounded-full">
                {{ $t('views.roles.selected', { count: form.selectedPermissionIds.length }) }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PermissionSelector v-model="form.selectedPermissionIds" />
            <p v-if="errors.permissions" class="text-xs text-destructive mt-4">{{ errors.permissions[0] }}</p>
          </CardContent>
        </Card>
      </div>
    </form>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
