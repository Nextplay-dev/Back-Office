<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, shallowRef } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  lat: number | string | null | undefined
  lng: number | string | null | undefined
  zoom?: number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 15
})

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<L.Map | null>(null)
const marker = shallowRef<L.Marker | null>(null)

function initMap() {
  if (!mapContainer.value || props.lat === null || props.lng === null || props.lat === undefined || props.lng === undefined) return

  if (map.value) {
    map.value.remove()
  }

  map.value = L.map(mapContainer.value, {
    zoomControl: false,
    scrollWheelZoom: false,
    fadeAnimation: true
  }).setView([Number(props.lat), Number(props.lng)], props.zoom)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map.value)

  updateMarker()

  L.control.zoom({ position: 'bottomright' }).addTo(map.value)
}

function updateMarker() {
  if (!map.value || props.lat === null || props.lng === null || props.lat === undefined || props.lng === undefined) return

  if (marker.value) {
    marker.value.remove()
  }

  const customIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute h-10 w-10 bg-primary/20 rounded-full animate-ping"></div>
        <div class="relative h-8 w-8 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center">
          <div class="h-2 w-2 bg-white rounded-full"></div>
        </div>
        <div class="absolute -bottom-1 h-3 w-3 bg-primary rotate-45 transform origin-center"></div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })

  marker.value = L.marker([Number(props.lat), Number(props.lng)], { icon: customIcon }).addTo(map.value)
  map.value.setView([Number(props.lat), Number(props.lng)], props.zoom)
}

onMounted(() => {
  initMap()
})

watch(() => [props.lat, props.lng], () => {
  if (map.value) {
    updateMarker()
  } else {
    initMap()
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<template>
  <div class="w-full relative z-0 overflow-hidden" :style="{ height: height || '100%' }">
    <div ref="mapContainer" class="w-full h-full" />
  </div>
</template>

<style scoped>
.leaflet-container {
  font-family: inherit;
}
</style>
