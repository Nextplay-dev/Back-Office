<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useRoleStore } from '@/stores/roles'
import { ArrowLeft, Loader2, Save } from 'lucide-vue-next'
import { onMounted } from 'vue'

import RoleSelector from '@/components/RoleSelector.vue'

const router = useRouter()
const roleStore = useRoleStore()
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: [] as string[]
})

onMounted(() => {
  roleStore.fetchRoles()
})

const errors = ref<Record<string, string[]>>({})

async function handleSubmit() {
  if (form.value.password !== form.value.password_confirmation) {
    error.value = "Passwords do not match"
    return
  }

  loading.value = true
  error.value = null
  errors.value = {}

  try {
    await userRoutes.create(form.value)
    router.push({ name: 'admin-users' })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create user'
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.users.new') }}</h2>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-2xl pb-12">
      <Card>
        <CardHeader>
          <CardTitle>{{ $t('views.users.details') }}</CardTitle>
          <CardDescription>{{ $t('views.users.form.accountSubtitle') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="error"
            class="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {{ error }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">{{ $t('views.users.name') }}</Label>
              <Input id="name" v-model="form.name" :placeholder="$t('common.placeholders.name')" required />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="email">{{ $t('views.users.email') }}</Label>
              <Input id="email" type="email" v-model="form.email" :placeholder="$t('common.placeholders.email')" required />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email[0] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="password">{{ $t('views.users.password') }}</Label>
              <Input id="password" type="password" v-model="form.password" :placeholder="$t('common.placeholders.password')" required />
              <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="password_confirmation">{{ $t('views.users.confirmPassword') }}</Label>
              <Input id="password_confirmation" type="password" v-model="form.password_confirmation"
                :placeholder="$t('common.placeholders.password')" required />
              <p v-if="errors.password_confirmation" class="text-xs text-destructive">{{ errors.password_confirmation[0]
              }}</p>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <Label>{{ $t('views.users.roles') }}</Label>
            <RoleSelector v-model="form.roles" />
            <p v-if="errors.roles" class="text-xs text-destructive mt-1">{{ errors.roles[0] }}</p>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          <Button variant="ghost" type="button" :disabled="loading" @click="router.back()">
            {{ $t('common.actions.cancel') }}
          </Button>
          <Button type="submit" :disabled="loading" class="bg-primary">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ $t('common.actions.create') }}
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>
