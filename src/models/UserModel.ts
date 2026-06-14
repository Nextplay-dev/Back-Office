export interface UserModel {
  id: number
  name: string
  email: string
  roles?: string[]
  permissions?: string[]
  highest_role_weight: number
  created_at: string
  updated_at: string
  bio?: string
  picture_profile_url?: string
}
