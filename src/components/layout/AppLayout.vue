<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchMe().catch(() => authStore.clearAuth())
  }
})
</script>

<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <AppSidebar />
    <SidebarInset class="flex flex-col h-screen overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
