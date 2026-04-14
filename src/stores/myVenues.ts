import { defineStore } from 'pinia'
import { ref } from 'vue'
import { myVenueRoutes } from '@/plugins/routes'
import type { VenueModel } from '@/models/VenueModel'

export const useMyVenuesStore = defineStore('myVenues', () => {
  const venues = ref<VenueModel[]>([])
  const loading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  async function fetchVenues(force = false) {
    if (isLoaded.value && !force && !error.value) return venues.value

    loading.value = true
    error.value = null
    
    try {
      const { data } = await myVenueRoutes.list()
      venues.value = data.data
      isLoaded.value = true
      return venues.value
    } catch (e) {
      error.value = 'Failed to fetch your venues'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getVenueById(id: number | string) {
    return venues.value.find(a => String(a.id) === String(id))
  }

  function reset() {
    venues.value = []
    isLoaded.value = false
    loading.value = false
    error.value = null
  }

  return { 
    venues, 
    loading, 
    isLoaded, 
    error, 
    fetchVenues, 
    getVenueById,
    reset 
  }
})
