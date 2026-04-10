<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Loader2, Save } from 'lucide-vue-next'
import { useRoleStore } from '@/stores/roles'

const router = useRouter()
const route = useRoute()
const roleStore = useRoleStore()

const userId = Number(route.params.id)
const loading = ref(false)
const fetching = ref(true)
const error = ref<string | null>(null)
const errors = ref<Record<string, string[]>>({})

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: [] as string[]
})

async function loadUser() {
  fetching.value = true
  try {
    await roleStore.fetchRoles()
    const { data } = await userRoutes.get(Number(route.params.id))
    form.value.name = data.name
    form.value.email = data.email
    form.value.roles = data.roles || []
  } catch (err: any) {
    error.value = 'Failed to load user data'
  } finally {
    fetching.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = null
  errors.value = {}

  // Only send passwords if they are being changed
  const payload: any = {
    name: form.value.name,
    email: form.value.email,
    roles: form.value.roles
  }

  if (form.value.password) {
    if (form.value.password !== form.value.password_confirmation) {
      error.value = "Passwords do not match"
      return
    }
    payload.password = form.value.password
    payload.password_confirmation = form.value.password_confirmation
  }

  try {
    await userRoutes.update(Number(route.params.id), payload)
    router.push({ name: 'admin-users' })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update user'
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
  } finally {
    loading.value = false
  }
}

function handleRoleChange(roleName: string, checked: boolean) {
  if (checked) {
    if (!form.value.roles.includes(roleName)) {
      form.value.roles.push(roleName)
    }
  } else {
    form.value.roles = form.value.roles.filter(r => r !== roleName)
  }
}

onMounted(loadUser)
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">{{ $t('views.users.edit') }}</h2>
        <p class="text-sm text-muted-foreground">#{{ userId }}</p>
      </div>
    </div>

    <div v-if="fetching" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <form v-else @submit.prevent="handleSubmit" class="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{{ $t('views.users.details') }}</CardTitle>
          <CardDescription>{{ $t('views.users.detailsSubtitle') }}</CardDescription>
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

          <div class="p-4 rounded-lg bg-muted/40 border space-y-4">
            <div class="space-y-1">
              <h4 class="text-sm font-semibold">{{ $t('views.users.security') }}</h4>
              <p class="text-xs text-muted-foreground">{{ $t('views.users.securitySubtitle') }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="password">{{ $t('views.users.newPassword') }}</Label>
                <Input id="password" type="password" v-model="form.password" :placeholder="$t('common.placeholders.password')" />
                <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password[0] }}</p>
              </div>
              <div class="space-y-2">
                <Label for="password_confirmation">{{ $t('views.users.confirmPassword') }}</Label>
                <Input id="password_confirmation" type="password" v-model="form.password_confirmation"
                  :placeholder="$t('common.placeholders.password')" />
                <p v-if="errors.password_confirmation" class="text-xs text-destructive">{{
                  errors.password_confirmation[0] }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <Label>{{ $t('views.users.roles') }}</Label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="role in roleStore.roles" :key="role.id"
                class="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <Checkbox :id="String(role.id)" :model-value="form.roles.includes(role.name)"
                  @update:model-value="(val) => handleRoleChange(role.name, val as boolean)" />
                <div class="grid gap-1.5 leading-none">
                  <label :for="String(role.id)"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                    {{ role.name }}
                  </label>
                </div>
              </div>
            </div>
            <p v-if="errors.roles" class="text-xs text-destructive mt-2">{{ errors.roles[0] }}</p>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          <Button variant="ghost" type="button" :disabled="loading" @click="router.back()">
            {{ $t('common.actions.cancel') }}
          </Button>
          <Button type="submit" :disabled="loading" class="bg-primary">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ $t('common.actions.saveChanges') }}
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>
