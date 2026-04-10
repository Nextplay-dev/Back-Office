export interface RoleModel {
  id: number
  name: string
  is_locked: boolean
  permissions?: PermissionModel[]
}

export interface PermissionModel {
  id: number
  name: string
}
