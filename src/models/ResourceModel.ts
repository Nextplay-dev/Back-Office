import type { ActivityModel } from './ActivityModel'
import type { VenueModel } from './VenueModel'

export type ResourceModel = {
  id: number
  venue_id: number
  name: string
  type: string
  capacity: number
  created_at: string
  updated_at: string
  venue?: VenueModel
  activities?: ActivityModel[]
}
