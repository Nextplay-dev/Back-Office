<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Loader2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Invalid credentials'
  } finally {
    loading.value = false
    password.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-primary/5 p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Zap class="h-7 w-7 text-primary-foreground" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight">NextPlay</h1>
          <p class="text-sm text-muted-foreground">Back Office</p>
        </div>
      </div>

      <Card class="shadow-xl border-border/50">
        <CardHeader class="space-y-1">
          <CardTitle class="text-xl">Sign in</CardTitle>
          <CardDescription>Enter your admin credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="handleLogin">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="admin@nextplay.com"
                autocomplete="email"
                required
                @keydown.enter="handleLogin"
              />
            </div>

            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                @keydown.enter="handleLogin"
              />
            </div>

            <div
              v-if="error"
              class="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle class="h-4 w-4 shrink-0" />
              {{ error }}
            </div>

            <Button type="submit" class="w-full" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Signing in…' : 'Sign in' }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
