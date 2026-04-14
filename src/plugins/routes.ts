import apiClient from '@/plugins/api'
import type { VenueModel } from '@/models/VenueModel'
import type { CategoryModel } from '@/models/CategoryModel'
import type { UserModel } from '@/models/UserModel'
import type { RoleModel, PermissionModel } from '@/models/RoleModel'
import type { PaginatedModel } from '@/models/PaginatedModel'

export type VenuePayload = {
  name: string
  address: string
  venue_category_id: number | null
  media: string | null
  latitude?: number | null
  longitude?: number | null
  manager_ids?: number[]
}

export type CategoryPayload = {
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

export type RolePayload = {
  name: string
  permissions?: number[]
  weight?: number
}

export const authRoutes = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: UserModel }>('/v1/auth/login', { email, password }),

  me: () => apiClient.get<UserModel>('/v1/auth/me'),

  logout: () => apiClient.post('/v1/auth/logout'),
}

export const venueRoutes = {
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[name]'] = search
    return apiClient.get<PaginatedModel<VenueModel>>('/v1/venues', { params })
  },

  get: (id: number) => apiClient.get<VenueModel>(`/v1/venues/${id}`),

  create: (payload: VenuePayload) => apiClient.post<VenueModel>('/v1/venues', payload),

  update: (id: number, payload: Partial<VenuePayload>) =>
    apiClient.put<VenueModel>(`/v1/venues/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/v1/venues/${id}`),
}

export const myVenueRoutes = {
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[name]'] = search
    return apiClient.get<PaginatedModel<VenueModel>>('/v1/my-venues', { params })
  },

  get: (id: number) => apiClient.get<VenueModel>(`/v1/my-venues/${id}`),

  update: (id: number, payload: Partial<VenuePayload>) =>
    apiClient.put<VenueModel>(`/v1/my-venues/${id}`, payload),
}

export const categoryRoutes = {
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[name]'] = search
    return apiClient.get<PaginatedModel<CategoryModel>>('/v1/categories', {
      params,
    })
  },

  get: (id: number) =>
    apiClient.get<CategoryModel>(`/v1/categories/${id}`),

  create: (payload: CategoryPayload) =>
    apiClient.post<CategoryModel>('/v1/categories', payload),

  update: (id: number, payload: Partial<CategoryPayload>) =>
    apiClient.put<CategoryModel>(`/v1/categories/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/v1/categories/${id}`),
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
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[name]'] = search
    return apiClient.get<PaginatedModel<RoleModel>>('/v1/roles', { params })
  },

  get: (id: number) => apiClient.get<RoleModel>(`/v1/roles/${id}`),

  create: (payload: RolePayload) => apiClient.post<RoleModel>('/v1/roles', payload),

  update: (id: number, payload: RolePayload) =>
    apiClient.put<RoleModel>(`/v1/roles/${id}`, payload),

  delete: (id: number) => apiClient.delete(`/v1/roles/${id}`),
}

export const permissionRoutes = {
  list: () => apiClient.get<PermissionModel[]>('/v1/permissions'),
}
