<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { venueRoutes } from '@/plugins/routes'
import type { VenueModel } from '@/models/VenueModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CategoryIcon from '@/components/CategoryIcon.vue'
import MapDisplay from '@/components/MapDisplay.vue'
import {
  MapPin,
  User,
  Calendar,
  Trophy,
  ExternalLink,
  Loader2,
  Navigation,
  Image as ImageIcon,
  Activity
} from 'lucide-vue-next'

const route = useRoute()
const venue = ref<VenueModel | null>(null)
const loading = ref(true)

async function fetchVenue(id: number) {
  loading.value = true
  try {
    const { data } = await venueRoutes.get(id)
    venue.value = data
  } catch (e) {
    console.error('Failed to fetch venue overview', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVenue(Number(route.params.id))
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchVenue(Number(newId))
  }
})

function openInGoogleMaps() {
  if (!venue.value) return
  const { latitude, longitude, address } = venue.value
  const query = latitude && longitude ? `${latitude},${longitude}` : encodeURIComponent(address)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
}
</script>

<style scoped></style>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground font-medium animate-pulse">{{
        $t('views.dashboard.myVenueOverview.loading') }}</p>
    </div>

    <template v-else-if="venue">
      <div class="relative overflow-hidden rounded-3xl bg-slate-900 min-h-[320px] sm:min-h-0 sm:aspect-21/7">
        <img v-if="venue.media" :src="venue.media" class="w-full h-full object-cover opacity-60" alt="Venue Banner" />
        <div v-else
          class="w-full h-full bg-linear-to-br from-primary/20 via-slate-900 to-slate-900 flex items-center justify-center">
          <Activity class="h-20 w-20 text-white/10" />
        </div>

        <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div
          class="absolute bottom-0 left-0 right-0 p-5 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 z-10">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <Badge v-if="venue.category" variant="outline"
                class="bg-white/10 backdrop-blur-md border-white/20 text-white gap-2 px-3 py-1">
                <CategoryIcon :icon="venue.category.icon" :color="venue.category.color" class="h-3.5 w-3.5" />
                {{ venue.category.name }}
              </Badge>
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">{{ venue.name }}</h1>
            <div class="flex items-center gap-2 text-white/70">
              <MapPin class="h-4 w-4" />
              <span class="text-sm sm:text-base font-medium">{{ venue.address }}</span>
            </div>
          </div>

          <Button @click="openInGoogleMaps" size="lg"
            class="w-full sm:w-auto rounded-2xl gap-2 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            <Navigation class="h-5 w-5" />
            {{ $t('views.dashboard.myVenueOverview.navigate') }}
            <ExternalLink class="h-4 w-4 opacity-50" />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="md:col-span-2 rounded-3xl border-none shadow-sm bg-linear-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle class="text-lg font-bold flex items-center gap-2">
              <ImageIcon class="h-5 w-5 text-primary" />
              {{ $t('views.dashboard.myVenueOverview.about') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <p class="text-muted-foreground leading-relaxed">
              {{ $t('views.dashboard.myVenueOverview.description', { name: venue.name }) }}
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                class="p-4 rounded-2xl bg-background border shadow-sm flex flex-col items-center text-center gap-1 group hover:border-primary/30 transition-colors">
                <div
                  class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Trophy class="h-5 w-5" />
                </div>
                <span class="text-2xl font-black tracking-tight">{{ venue.tournaments_count }}</span>
                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{
                  $t('views.dashboard.myVenueOverview.stats.tournaments') }}</span>
              </div>

              <div
                class="p-4 rounded-2xl bg-background border shadow-sm flex flex-col items-center text-center gap-1 group hover:border-primary/30 transition-colors">
                <div
                  class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <User class="h-5 w-5" />
                </div>
                <span class="text-2xl font-black tracking-tight">{{ venue.managers?.length || 0 }}</span>
                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{
                  $t('views.dashboard.myVenueOverview.stats.managers') }}</span>
              </div>

              <div
                class="p-4 rounded-2xl bg-background border shadow-sm flex flex-col items-center text-center gap-1 group hover:border-primary/30 transition-colors">
                <div
                  class="h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Calendar class="h-5 w-5" />
                </div>
                <span class="text-2xl font-black tracking-tight">{{ new Date(venue.created_at).getFullYear()
                  }}</span>
                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{
                  $t('views.dashboard.myVenueOverview.stats.founded') }}</span>
              </div>
            </div>
          </CardContent>
        </Card>


        <Card v-if="venue.latitude !== null && venue.longitude !== null"
          class="rounded-3xl border-none shadow-sm overflow-hidden py-0 gap-0 h-96 flex flex-col">
          <div class="p-6 bg-muted/50 flex items-center justify-between border-b shrink-0">
            <h3 class="font-bold flex items-center gap-2">
              <MapPin class="h-5 w-5 text-primary" />
              {{ $t('views.dashboard.myVenueOverview.location') }}
            </h3>
          </div>
          <CardContent class="p-0 relative z-0 flex-1 min-h-0">
            <MapDisplay :lat="venue.latitude" :lng="venue.longitude" :zoom="12" />
          </CardContent>
        </Card>
      </div>

    </template>
  </div>
</template>
