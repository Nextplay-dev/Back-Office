export interface RoleModel {
  id: number
  name: string
  is_locked: boolean
  weight: number
  permissions?: PermissionModel[]
}

export interface PermissionModel {
  id: number
  name: string
}
