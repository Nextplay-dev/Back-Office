import apiClient from '@/plugins/api'
import type { VenueModel } from '@/models/VenueModel'
import type { CategoryModel } from '@/models/CategoryModel'
import type { UserModel } from '@/models/UserModel'
import type { RoleModel, PermissionModel } from '@/models/RoleModel'
import type { ResourceModel } from '@/models/ResourceModel'
import type { AvailabilityModel } from '@/models/AvailabilityModel'
import type { ExceptionModel } from '@/models/ExceptionModel'
import type { PaginatedModel } from '@/models/PaginatedModel'
import type { ActivityModel } from '@/models/ActivityModel'

export type VenuePayload = {
  name: string
  address: string
  venue_category_id: number | null
  media: string | null
  latitude?: number | null
  longitude?: number | null
  manager_ids?: number[]
  is_virtual?: boolean
  external_booking_url?: string | null
  description?: string | null
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

export type ResourcePayload = {
  name: string
  type: string
  capacity: number
  activity_ids?: number[]
}

export type AvailabilityPayload = {
  day_of_week: number
  start_time: string
  end_time: string
}

export type ExceptionPayload = {
  start_at: string
  end_at: string
  type: 'closed' | 'maintenance'
}

export type ActivityPayload = {
  name: string
  duration_minutes: number
  slot_interval_minutes: number
  rules_json?: Record<string, any>
}

export const authRoutes = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: UserModel }>('/v1/auth/login', { email, password }),

  me: () => apiClient.get<UserModel>('/v1/me'),

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

export const resourceRoutes = {
  list: (venueId: number) => apiClient.get<ResourceModel[]>(`/v1/venues/${venueId}/resources`),
  get: (id: number) => apiClient.get<ResourceModel>(`/v1/resources/${id}`),
  create: (venueId: number, payload: ResourcePayload) =>
    apiClient.post<ResourceModel>(`/v1/venues/${venueId}/resources`, payload),
  update: (id: number, payload: Partial<ResourcePayload>) =>
    apiClient.put<ResourceModel>(`/v1/resources/${id}`, payload),
  delete: (id: number) => apiClient.delete(`/v1/resources/${id}`),
  bookings: (id: number) => apiClient.get<any[]>(`/v1/resources/${id}/bookings`),
}

export const availabilityRoutes = {
  list: (resourceId: number) =>
    apiClient.get<AvailabilityModel[]>(`/v1/resources/${resourceId}/availabilities`),
  create: (resourceId: number, payload: AvailabilityPayload) =>
    apiClient.post<AvailabilityModel>(`/v1/resources/${resourceId}/availabilities`, payload),
  update: (id: number, payload: Partial<AvailabilityPayload>) =>
    apiClient.put<AvailabilityModel>(`/v1/availabilities/${id}`, payload),
  delete: (id: number) => apiClient.delete(`/v1/availabilities/${id}`),
}

export const exceptionRoutes = {
  list: (resourceId: number) =>
    apiClient.get<ExceptionModel[]>(`/v1/resources/${resourceId}/exceptions`),
  create: (resourceId: number, payload: ExceptionPayload) =>
    apiClient.post<ExceptionModel>(`/v1/resources/${resourceId}/exceptions`, payload),
  update: (id: number, payload: Partial<ExceptionPayload>) =>
    apiClient.put<ExceptionModel>(`/v1/exceptions/${id}`, payload),
  delete: (id: number) => apiClient.delete(`/v1/exceptions/${id}`),
}

export const activityRoutes = {
  list: (venueId: number, search?: string) => {
    const params: Record<string, string> = {}

    if (search) {
      params['filter[name]'] = search
    }

    return apiClient.get<ActivityModel[]>(`/v1/venues/${venueId}/activities`, { params })
  },
  get: (venueId: number, id: number) => apiClient.get<ActivityModel>(`/v1/venues/${venueId}/activities/${id}`),
  create: (venueId: number, payload: ActivityPayload) =>
    apiClient.post<ActivityModel>(`/v1/venues/${venueId}/activities`, payload),
  update: (venueId: number, id: number, payload: Partial<ActivityPayload>) =>
    apiClient.put<ActivityModel>(`/v1/venues/${venueId}/activities/${id}`, payload),
  delete: (venueId: number, id: number) => apiClient.delete(`/v1/venues/${venueId}/activities/${id}`),
}

export const permissionRoutes = {
  list: () => apiClient.get<PermissionModel[]>('/v1/permissions'),
}

export const bugReportRoutes = {
  list: (page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[message]'] = search
    return apiClient.get<PaginatedModel<any>>('/v1/bug-reports', { params })
  },
  delete: (id: number) => apiClient.delete(`/v1/bug-reports/${id}`),
}

export const venueTournamentRoutes = {
  list: (venueId: number, page = 1, search?: string) => {
    const params: Record<string, string | number> = { page }
    if (search) params['filter[title]'] = search
    return apiClient.get<PaginatedModel<any>>(`/v1/venues/${venueId}/tournaments`, { params })
  },
  get: (id: number) => apiClient.get<any>(`/v1/venues/tournaments/${id}`),
  create: (venueId: number, payload: any) => apiClient.post<any>(`/v1/venues/${venueId}/tournaments`, payload),
  update: (id: number, payload: any) => apiClient.put<any>(`/v1/venues/tournaments/${id}`, payload),
  delete: (id: number) => apiClient.delete(`/v1/venues/tournaments/${id}`),
}

export const bookingRoutes = {
  create: (payload: { resource_id: number; activity_id: number; start_at: string; end_at: string; units?: number }) =>
    apiClient.post<any>('/v1/bookings', payload),
  availableSlots: (venueId: number, activityId: number, from: string, to: string) =>
    apiClient.get<any[]>(`/v1/venues/${venueId}/activities/${activityId}/available-slots`, {
      params: { from, to }
    }),
}

export const analyticsRoutes = {
  getOverview: (page = 1, action?: string) => {
    const params: Record<string, string | number> = { page }
    if (action) params['action'] = action
    return apiClient.get<any>('/v1/analytics', { params })
  },
}