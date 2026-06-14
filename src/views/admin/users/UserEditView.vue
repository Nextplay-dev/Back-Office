<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userRoutes } from '@/plugins/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Loader2, Save } from 'lucide-vue-next'
import { useRoleStore } from '@/stores/roles'

import RoleSelector from '@/components/RoleSelector.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const roleStore = useRoleStore()
const auth = useAuthStore()

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
  roles: [] as string[],
  bio: '',
  picture_profile_url: ''
})

const roleWeight = ref<number>(0);

const readonly = computed(() => {
  if (!auth.canAccess('user.update')) return true;
  if (auth.user?.id !== userId && (auth.user?.highest_role_weight || 0) <= roleWeight.value) return true
  return false
})

const roleReadonly = computed(() => {
  if (auth.user?.id === userId) return true;
  return readonly.value
})

async function loadUser() {
  fetching.value = true
  try {
    await roleStore.fetchRoles()
    const { data } = await userRoutes.get(Number(route.params.id))
    form.value.name = data.name
    form.value.email = data.email
    form.value.roles = data.roles || []
    form.value.bio = data.bio || ''
    form.value.picture_profile_url = data.picture_profile_url || ''
    roleWeight.value = data.highest_role_weight
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

  const payload: any = {
    name: form.value.name,
    email: form.value.email,
    roles: form.value.roles,
    bio: form.value.bio || null,
    picture_profile_url: form.value.picture_profile_url || null
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

onMounted(loadUser)
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 px-4 sm:px-0">
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

    <form v-else @submit.prevent="handleSubmit" class="max-w-2xl pb-12">
      <Card class="pb-0">
        <CardHeader>
          <CardTitle>{{ $t('views.users.details') }}</CardTitle>
          <CardDescription>{{ $t('views.users.detailsSubtitle') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4 pb-5">
          <div v-if="error"
            class="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {{ error }}
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="name">{{ $t('views.users.name') }}</Label>
              <Input id="name" v-model="form.name" :placeholder="$t('common.placeholders.name')" required
                :readonly="readonly" />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="email">{{ $t('views.users.email') }}</Label>
              <Input id="email" type="email" v-model="form.email" :placeholder="$t('common.placeholders.email')"
                required :readonly="readonly" />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email[0] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="picture_profile_url">Photo de profil (URL)</Label>
              <Input id="picture_profile_url" v-model="form.picture_profile_url" placeholder="https://example.com/photo.jpg"
                :readonly="readonly" />
              <p v-if="errors.picture_profile_url" class="text-xs text-destructive">{{ errors.picture_profile_url[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="bio">Bio</Label>
              <Input id="bio" v-model="form.bio" placeholder="Bio de l'utilisateur"
                :readonly="readonly" />
              <p v-if="errors.bio" class="text-xs text-destructive">{{ errors.bio[0] }}</p>
            </div>
          </div>

          <div v-if="!readonly" class="p-4 rounded-lg bg-muted/40 border space-y-4">
            <div class="space-y-1">
              <h4 class="text-sm font-semibold">{{ $t('views.users.security') }}</h4>
              <p class="text-xs text-muted-foreground">{{ $t('views.users.securitySubtitle') }}</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="password">{{ $t('views.users.newPassword') }}</Label>
                <Input id="password" type="password" v-model="form.password"
                  :placeholder="$t('common.placeholders.password')" :readonly="readonly" />
                <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password[0] }}</p>
              </div>
              <div class="space-y-2">
                <Label for="password_confirmation">{{ $t('views.users.confirmPassword') }}</Label>
                <Input id="password_confirmation" type="password" v-model="form.password_confirmation"
                  :placeholder="$t('common.placeholders.password')" :readonly="readonly" />
                <p v-if="errors.password_confirmation" class="text-xs text-destructive">{{
                  errors.password_confirmation[0] }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <Label>{{ $t('views.users.roles') }}</Label>
            <RoleSelector v-model="form.roles" :readonly="roleReadonly" />
            <p v-if="errors.roles" class="text-xs text-destructive mt-2">{{ errors.roles[0] }}</p>
          </div>
        </CardContent>
        <CardFooter v-if="!readonly"
          class="flex flex-col-reverse gap-3 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-6">
          <Button variant="ghost" type="button" :disabled="loading" class="w-full sm:w-auto" @click="router.back()">
            {{ $t('common.actions.cancel') }}
          </Button>
          <Button type="submit" :disabled="loading" class="bg-primary w-full sm:w-auto">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ $t('common.actions.saveChanges') }}
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>
