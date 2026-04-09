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
    router.push({ name: 'users' })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create user'
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
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h2 class="text-xl font-bold">New User</h2>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>User Account</CardTitle>
          <CardDescription>Create a new account for the application or back-office.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="error"
            class="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {{ error }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Full Name</Label>
              <Input id="name" v-model="form.name" placeholder="John Doe" required />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="email">Email Address</Label>
              <Input id="email" type="email" v-model="form.email" placeholder="john@example.com" required />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email[0] }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input id="password" type="password" v-model="form.password" placeholder="••••••••" required />
              <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password[0] }}</p>
            </div>
            <div class="space-y-2">
              <Label for="password_confirmation">Confirm Password</Label>
              <Input id="password_confirmation" type="password" v-model="form.password_confirmation"
                placeholder="••••••••" required />
              <p v-if="errors.password_confirmation" class="text-xs text-destructive">{{ errors.password_confirmation[0]
              }}</p>
            </div>
          </div>

          <div class="space-y-3 pt-2">
            <Label>Roles & Permissions</Label>
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
            <p v-if="errors.roles" class="text-xs text-destructive mt-1">{{ errors.roles[0] }}</p>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-3 border-t bg-muted/30 px-6 py-4">
          <Button variant="ghost" type="button" :disabled="loading" @click="router.back()">
            Cancel
          </Button>
          <Button type="submit" :disabled="loading" class="bg-primary">
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            Create User
          </Button>
        </CardFooter>
      </Card>
    </form>
  </div>
</template>
