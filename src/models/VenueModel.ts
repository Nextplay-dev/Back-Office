import type { CategoryModel } from './CategoryModel'
import type { ResourceModel } from './ResourceModel'
import type { UserModel } from './UserModel'

export interface OpeningHourModel {
  id: number
  day_of_week: number
  exceptional_date: string | null
  opens_at: string
  closes_at: string
  is_closed: boolean
  label: string | null
}

export interface VenueModel {
  id: number
  name: string
  address: string
  media: string | null
  phone: string | null
  website: string | null
  tournaments_count: number
  category_id: number | null
  category: CategoryModel | null
  managers?: UserModel[]
  resources?: ResourceModel[]
  opening_hours?: OpeningHourModel[]
  latitude: number | null
  longitude: number | null
  is_virtual?: boolean
  external_booking_url?: string | null
  external_booking_clicks_count?: number
  visits_count?: number
  description?: string | null
  created_at: string
  updated_at: string
}
