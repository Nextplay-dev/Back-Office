<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const error = ref('')

onMounted(async () => {
  const token = route.query.token as string
  const urlError = route.query.error as string

  if (urlError) {
    error.value = decodeURIComponent(urlError)
    return
  }

  if (!token) {
    error.value = 'No token provided.'
    return
  }

  try {
    await authStore.loginWithToken(token)
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Authentication failed'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-secondary/30 to-primary/5 p-4">
    <div class="w-full max-w-md space-y-6 text-center">
      <div v-if="error" class="space-y-4">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mx-auto">
          <AlertCircle class="h-7 w-7 text-destructive" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-destructive">Authentication Error</h1>
        <p class="text-sm text-muted-foreground">{{ error }}</p>
        <button
          @click="router.push('/login')"
          class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:focus:ring-2 focus:ring-offset-2"
        >
          Back to Login
        </button>
      </div>
      <div v-else class="space-y-4">
        <Loader2 class="h-10 w-10 animate-spin text-primary mx-auto" />
        <h1 class="text-2xl font-bold tracking-tight">Authenticating...</h1>
        <p class="text-sm text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  </div>
</template>
