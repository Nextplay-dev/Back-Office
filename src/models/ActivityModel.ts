import type { ActivityCategoryModel } from './ActivityCategoryModel'

export interface ActivityModel {
  id: number
  name: string
  address: string
  media: string | null
  tournaments_count: number
  category_id: number | null
  category: ActivityCategoryModel | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}
