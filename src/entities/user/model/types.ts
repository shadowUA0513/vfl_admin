export type Role = 'superadmin' | 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}
