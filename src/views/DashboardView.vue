<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const hasAdminDashboard = computed(() => authStore.canAccess('back-office.administration.dashboard'))

onMounted(() => {
  if (hasAdminDashboard.value) {
    return router.push({ name: 'admin-dashboard' })
  }

  router.push({ name: 'my-dashboard' })
})
</script>

<template>
</template>
