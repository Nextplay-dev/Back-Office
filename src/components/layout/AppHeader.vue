<script setup lang="ts">
import { useRoute } from 'vue-router'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

const route = useRoute()

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  activities: 'Activities',
  'activities-create': 'New Activity',
  'activities-edit': 'Edit Activity',
  categories: 'Categories',
  'categories-create': 'New Category',
  'categories-edit': 'Edit Category',
  users: 'Users',
  'users-create': 'New User',
  'users-edit': 'Edit User',
}

const pageTitle = computed(() => breadcrumbMap[String(route.name)] ?? 'Admin')

import { computed } from 'vue'
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 h-4" />
    <div class="flex flex-1 items-center justify-between">
      <h1 class="text-sm font-semibold text-foreground">{{ pageTitle }}</h1>
    </div>
  </header>
</template>
