import { defineStore } from 'pinia'
import { ref } from 'vue'
import { permissionRoutes } from '@/plugins/routes'
import type { PermissionModel } from '@/models/RoleModel'

export const usePermissionStore = defineStore('permissions', () => {
  const permissions = ref<PermissionModel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    if (permissions.value.length > 0) return
    
    loading.value = true
    error.value = null
    try {
      const { data } = await permissionRoutes.list()
      permissions.value = data
    } catch (err: any) {
      error.value = 'Failed to load permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    permissions,
    loading,
    error,
    fetchAll
  }
})
