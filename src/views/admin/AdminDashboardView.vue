<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { activityRoutes, activityCategoryRoutes, userRoutes } from '@/plugins/routes'
import { Dumbbell, Tag, Users, TrendingUp } from 'lucide-vue-next'

const stats = ref([
  { title: 'Activities', value: '—', icon: Dumbbell, color: 'text-primary', bg: 'bg-primary/10' },
  { title: 'Categories', value: '—', icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Users', value: '—', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
  } catch (e) {
    console.error('Failed to fetch admin stats', e)
  }
})
</script>

<template>
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">{{ $t('views.dashboard.admin.title') }} 👋</h2>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t('views.dashboard.admin.subtitle') }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <Card v-for="stat in stats" :key="stat.title" class="transition-shadow hover:shadow-md">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">{{ $t('components.sidebar.' + stat.title.toLowerCase()) }}</CardTitle>
            <div :class="['flex h-9 w-9 items-center justify-center rounded-xl', stat.bg]">
              <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-3xl font-bold">{{ stat.value }}</p>
            <p class="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <TrendingUp class="h-3 w-3" /> {{ $t('views.dashboard.admin.stats.totalRegistered') }}
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <Card class="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle class="text-base">{{ $t('views.dashboard.admin.quickActions') }}</CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-2 gap-3">
            <RouterLink v-for="link in [
              { label: $t('views.dashboard.admin.actions.addActivity'), to: { name: 'admin-activities-create' } },
              { label: $t('views.dashboard.admin.actions.addCategory'), to: { name: 'admin-categories-create' } },
              { label: $t('views.dashboard.admin.actions.allActivities'), to: { name: 'admin-activities' } },
              { label: $t('views.dashboard.admin.actions.allUsers'), to: { name: 'admin-users' } },
            ]" :key="link.label" :to="link.to"
              class="flex items-center justify-center rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              {{ link.label }}
            </RouterLink>
          </CardContent>
        </Card>
      </div>
    </div>
</template>
