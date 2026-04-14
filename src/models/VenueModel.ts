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
  created_at: string
  updated_at: string
}
