<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { activityRoutes } from '@/plugins/routes'
import { activityCategoryRoutes } from '@/plugins/routes'
import { userRoutes } from '@/plugins/routes'
import { Dumbbell, Tag, Users, TrendingUp } from 'lucide-vue-next'

const stats = ref([
  { title: 'Activities', value: '—', icon: Dumbbell, color: 'text-primary', bg: 'bg-primary/10' },
  { title: 'Categories', value: '—', icon: Tag, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  { title: 'Users', value: '—', icon: Users, color: 'text-chart-3', bg: 'bg-chart-3/10' },
])

onMounted(async () => {
  try {
    const [activitiesRes, categoriesRes, usersRes] = await Promise.all([
      activityRoutes.list(1),
      activityCategoryRoutes.list(1),
      userRoutes.list(1),
    ])
    stats.value[0].value = String(activitiesRes.data.meta.total)
    stats.value[1].value = String(categoriesRes.data.meta.total)
    stats.value[2].value = String(usersRes.data.meta.total)
  } catch {
    // Silently handle fetch errors — values remain '—'
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Welcome back 👋</h2>
      <p class="text-muted-foreground mt-1 text-sm">Here's what's happening on NextPlay.</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.title" class="transition-shadow hover:shadow-md">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">{{ stat.title }}</CardTitle>
          <div :class="['flex h-9 w-9 items-center justify-center rounded-xl', stat.bg]">
            <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-3xl font-bold">{{ stat.value }}</p>
          <p class="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <TrendingUp class="h-3 w-3" /> Total registered
          </p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Card class="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle class="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-2 gap-3">
          <RouterLink
            v-for="link in [
              { label: 'Add Activity', to: { name: 'activities-create' } },
              { label: 'Add Category', to: { name: 'categories-create' } },
              { label: 'All Activities', to: { name: 'activities' } },
              { label: 'All Users', to: { name: 'users' } },
            ]"
            :key="link.label"
            :to="link.to"
            class="flex items-center justify-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {{ link.label }}
          </RouterLink>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
