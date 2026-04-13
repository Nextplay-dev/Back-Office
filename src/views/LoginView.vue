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

function handleGoogleLogin() {
  const redirectUrl = `${window.location.origin}/auth/callback`
  window.location.href = `${import.meta.env.VITE_API_URL}/v1/auth/google/redirect?redirect_to=${encodeURIComponent(redirectUrl)}`
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-secondary/30 to-primary/5 p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Zap class="h-7 w-7 text-primary-foreground" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight">NextPlay</h1>
          <p class="text-sm text-muted-foreground">{{ $t('common.actions.view') }}</p>
        </div>
      </div>

      <Card class="shadow-xl border-border/50">
        <CardHeader class="space-y-1">
          <CardTitle class="text-xl">{{ $t('views.login.title') }}</CardTitle>
          <CardDescription>{{ $t('views.login.subtitle') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="handleLogin">
            <div class="space-y-2">
              <Label for="email">{{ $t('views.login.email') }}</Label>
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
              <Label for="password">{{ $t('views.login.password') }}</Label>
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
              {{ loading ? $t('views.login.submitting') : $t('views.login.submit') }}
            </Button>

            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-border" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-card px-2 text-muted-foreground">{{ $t('common.or', 'OR') }}</span>
              </div>
            </div>

            <Button type="button" variant="outline" class="w-full bg-white dark:bg-card text-foreground border-border hover:bg-secondary/50" :disabled="loading" @click="handleGoogleLogin">
              <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {{ $t('views.login.google', 'Continue with Google') }}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
