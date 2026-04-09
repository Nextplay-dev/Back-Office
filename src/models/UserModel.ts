export interface UserModel {
  id: number
  name: string
  email: string
  roles?: string[]
  permissions?: string[]
  created_at: string
  updated_at: string
}
