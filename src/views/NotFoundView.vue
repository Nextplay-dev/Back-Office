<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { FileQuestion } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="flex h-[80vh] flex-col items-center justify-center space-y-4">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
      <FileQuestion class="h-10 w-10 text-muted-foreground" />
    </div>
    <div class="text-center">
      <h1 class="text-2xl font-bold tracking-tight">404 - Page Not Found</h1>
      <p class="text-muted-foreground mt-2">
        The page you are looking for does not exist or you don't have permission to view it.
      </p>
    </div>
    <Button @click="router.push('/')">
      Back to Dashboard
    </Button>
  </div>
</template>
