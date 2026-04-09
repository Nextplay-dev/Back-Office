import apiClient from '@/plugins/api'
import type { ActivityModel } from '@/models/ActivityModel'
import type { ActivityCategoryModel } from '@/models/ActivityCategoryModel'
import type { UserModel } from '@/models/UserModel'
import type { RoleModel } from '@/models/RoleModel'
import type { PaginatedModel } from '@/models/PaginatedModel'

export type ActivityPayload = {
  name: string
  address: string
  activity_category_id: number | null
  media: string | null
  latitude?: number | null
  longitude?: number | null
}

export type ActivityCategoryPayload = {
  name: string
  icon: string | null
  color: string | null
}

export type UserPayload = {
  name: string
  email: string
  password?: string
  password_confirmation?: string
  roles?: string[]
}

export const authRoutes = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: UserModel }>('/v1/auth/login', { email, password }),

  me: () => apiClient.get<UserModel>('/v1/auth/me'),

  logout: () => apiClient.post('/v1/auth/logout'),
}

export const activityRoutes = {
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[name]'] = search
    return apiClient.get<PaginatedModel<ActivityModel>>('/v1/activities', { params })
  },

  get: (id: number) => apiClient.get<ActivityModel>(`/v1/activities/${id}`),

  create: (payload: ActivityPayload) => apiClient.post<ActivityModel>('/v1/activities', payload),

  update: (id: number, payload: Partial<ActivityPayload>) =>
    apiClient.put<ActivityModel>(`/v1/activities/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/v1/activities/${id}`),
}

export const activityCategoryRoutes = {
  list: (page = 1) =>
    apiClient.get<PaginatedModel<ActivityCategoryModel>>('/v1/activity-categories', {
      params: { page },
    }),

  get: (id: number) =>
    apiClient.get<ActivityCategoryModel>(`/v1/activity-categories/${id}`),

  create: (payload: ActivityCategoryPayload) =>
    apiClient.post<ActivityCategoryModel>('/v1/activity-categories', payload),

  update: (id: number, payload: Partial<ActivityCategoryPayload>) =>
    apiClient.put<ActivityCategoryModel>(`/v1/activity-categories/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/v1/activity-categories/${id}`),
}

export const userRoutes = {
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[name]'] = search
    return apiClient.get<PaginatedModel<UserModel>>('/v1/users', { params })
  },

  get: (id: number) => apiClient.get<UserModel>(`/v1/users/${id}`),

  create: (payload: UserPayload) => apiClient.post<UserModel>('/v1/users', payload),

  update: (id: number, payload: Partial<UserPayload>) =>
    apiClient.put<UserModel>(`/v1/users/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/v1/users/${id}`),
}

export const roleRoutes = {
  list: () => apiClient.get<RoleModel[]>('/v1/roles'),
}
