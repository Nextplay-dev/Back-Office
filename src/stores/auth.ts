import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserModel } from '@/models/UserModel'
import apiClient from '@/plugins/api'

const TOKEN_KEY = 'nextplay_admin_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<UserModel | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function fetchMe() {
    const { data } = await apiClient.get<UserModel>('/v1/auth/me')
    user.value = data
    return data
  }

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<{ token: string; user: UserModel }>('/v1/auth/login', {
      email,
      password,
    })
    setToken(data.token)
    if (!data.user.permissions?.includes('back-office.access')) {
      logout()
      throw { response: { data: { message: 'User is not allowed to access the back-office' } } }
    }
    user.value = data.user
  }

  async function logout() {
    try {
      await apiClient.post('/v1/auth/logout')
    } finally {
      clearAuth()
    }
  }

  function hasPermission(permission: string) {
    if (!user.value?.permissions) return false
    return user.value.permissions.includes(permission)
  }

  function canAccess(permissions: string | string[]) {
    if (!permissions) return true
    if (typeof permissions === 'string') return hasPermission(permissions)
    return permissions.some((p) => hasPermission(p))
  }

  return { token, user, isAuthenticated, setToken, clearAuth, fetchMe, login, logout, hasPermission, canAccess }
})
