export interface ActivityModel {
  id: number
  name: string
  duration_minutes: number
  slot_interval_minutes: number
  rules: Record<string, any>
  venue_id: number
  created_at?: string
  updated_at?: string
}
