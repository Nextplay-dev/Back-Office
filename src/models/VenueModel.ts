import type { CategoryModel } from './CategoryModel'
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
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}
