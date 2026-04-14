export type ExceptionModel = {
  id: number
  resource_id: number
  start_at: string
  end_at: string
  type: 'closed' | 'maintenance'
  created_at: string
  updated_at: string
}
