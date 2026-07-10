import type { CategoryModel } from './CategoryModel'
import type { ResourceModel } from './ResourceModel'
import type { UserModel } from './UserModel'

export interface VenueModel {
  id: number
  name: string
  address: string
  media: string | null
  tournaments_count: number
  category_id: number | null
  category: CategoryModel | null
  managers?: UserModel[]
  resources?: ResourceModel[]
  latitude: number | null
  longitude: number | null
  is_virtual?: boolean
  external_booking_url?: string | null
  external_booking_clicks_count?: number
  description?: string | null
  created_at: string
  updated_at: string
}
