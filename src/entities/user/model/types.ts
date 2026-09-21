/* Mirrors the API's admin roles (dto.CreateAdminRequest.role enum). The API
   types `role` as a plain string, so anything unrecognised is treated as the
   lowest privilege rather than crashing a guard. */
export type Role = 'super_admin' | 'editor'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  is_active?: boolean
}
