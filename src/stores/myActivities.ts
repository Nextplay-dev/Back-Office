import { defineStore } from 'pinia'
import { ref } from 'vue'
import { myActivityRoutes } from '@/plugins/routes'
import type { ActivityModel } from '@/models/ActivityModel'

export const useMyActivitiesStore = defineStore('myActivities', () => {
  const activities = ref<ActivityModel[]>([])
  const loading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  async function fetchActivities(force = false) {
    if (isLoaded.value && !force && !error.value) return activities.value

    loading.value = true
    error.value = null
    
    try {
      const { data } = await myActivityRoutes.list()
      activities.value = data.data
      isLoaded.value = true
      return activities.value
    } catch (e) {
      error.value = 'Failed to fetch your activities'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getActivityById(id: number | string) {
    return activities.value.find(a => String(a.id) === String(id))
  }

  function reset() {
    activities.value = []
    isLoaded.value = false
    loading.value = false
    error.value = null
  }

  return { 
    activities, 
    loading, 
    isLoaded, 
    error, 
    fetchActivities, 
    getActivityById,
    reset 
  }
})
