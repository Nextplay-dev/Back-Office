<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMyVenuesStore } from '@/stores/myVenues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CategoryIcon from '@/components/CategoryIcon.vue'
import {
  Dumbbell,
  ArrowRight,
  Trophy,
  Users as UsersIcon,
  Calendar
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const myVenuesStore = useMyVenuesStore()

onMounted(async () => {
  try {
    await myVenuesStore.fetchVenues()
    if (myVenuesStore.venues.length === 1) {
      return router.push({ name: 'my-venue-overview', params: { id: myVenuesStore.venues[0].id } })
    }
  } catch (e) {
    console.error('Failed to fetch dashboard venues', e)
  }
})
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto">
    <!-- Welcome Header -->
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-black tracking-tight flex items-center gap-3">
        {{ $t('views.dashboard.my.title', { name: authStore.user?.name }) }}
        <span class="animate-bounce-slow">👋</span>
      </h1>
      <p class="text-muted-foreground text-lg italic">
        {{ $t('views.dashboard.my.subtitle') }}
      </p>
    </div>

    <!-- Venue Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Dumbbell class="h-5 w-5 text-primary" />
          {{ $t('views.dashboard.my.assignedVenues') }}
        </h2>
        <Badge variant="secondary" class="rounded-full px-3">
          {{ $t('views.dashboard.my.venuesCount', { count: myVenuesStore.venues.length }) }}
        </Badge>
      </div>

      <!-- Loading State -->
      <div v-if="myVenuesStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="i in 3" :key="i" class="rounded-3xl border-none shadow-sm animate-pulse h-48 bg-muted/50" />
      </div>

      <!-- Empty State -->
      <div v-else-if="myVenuesStore.venues.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
        <div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <Dumbbell class="h-8 w-8" />
        </div>
        <h3 class="font-bold text-lg">{{ $t('views.dashboard.my.noVenues.title') }}</h3>
        <p class="text-sm text-muted-foreground">{{ $t('views.dashboard.my.noVenues.description') }}</p>
      </div>

      <!-- Venue Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink v-for="venue in myVenuesStore.venues" :key="venue.id"
          :to="{ name: 'my-venue-overview', params: { id: venue.id } }" class="group">
          <Card
            class="h-full rounded-3xl border-none shadow-sm overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
            <div class="h-32 relative bg-slate-900">
              <img v-if="venue.media" :src="venue.media" class="w-full h-full object-cover opacity-60"
                alt="Venue media" />
              <div v-else
                class="w-full h-full bg-linear-to-br from-primary/30 to-slate-950 flex items-center justify-center">
                <Dumbbell class="h-10 w-10 text-white/20" />
              </div>
              <div class="absolute top-4 left-4">
                <Badge v-if="venue.category" class="bg-white/20 backdrop-blur-md border-white/30 text-white gap-2">
                  <CategoryIcon :icon="venue.category.icon" :color="venue.category.color" class="h-3 w-3" />
                  {{ venue.category.name }}
                </Badge>
              </div>
            </div>
            <CardHeader class="pb-2">
              <CardTitle
                class="text font-black group-hover:text-primary transition-colors flex items-center justify-between">
                {{ venue.name }}
                <ArrowRight
                  class="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex items-center gap-4 text-muted-foreground">
                <div class="flex items-center gap-1.5">
                  <Trophy class="h-3.5 w-3.5" />
                  <span class="text-xs font-bold">{{ venue.tournaments_count || 0 }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <UsersIcon class="h-3.5 w-3.5" />
                  <span class="text-xs font-bold">{{ venue.managers?.length || 0 }}</span>
                </div>
                <div class="flex items-center gap-1.5 ml-auto">
                  <Calendar class="h-3.5 w-3.5" />
                  <span class="text-[10px] font-black uppercase">{{ new Date(venue.created_at).getFullYear()
                    }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>
