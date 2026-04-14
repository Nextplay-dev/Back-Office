import { defineStore } from 'pinia'
import { ref } from 'vue'
import { roleRoutes } from '@/plugins/routes'
import type { RoleModel } from '@/models/RoleModel'

export const useRoleStore = defineStore('roles', () => {
  const roles = ref<RoleModel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRoles(force: boolean = false) {
    // If roles are already loaded, don't fetch again
    if (roles.value.length > 0 && !force) return

    loading.value = true
    error.value = null
    try {
      const { data } = await roleRoutes.list()
      roles.value = data.data
    } catch (err: any) {
      error.value = 'Failed to load roles'
    } finally {
      loading.value = false
    }
  }

  return { roles, loading, error, fetchRoles }
})
