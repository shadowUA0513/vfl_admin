import type { Role, User } from '../model/types'

/* Role ranking for route guards. A route declares the minimum role it needs
   and anything at or above that rank passes, so guards don't have to list
   every role explicitly. */
const RANK: Record<Role, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  superadmin: 3,
}

export function hasRole(user: User | null, minimum: Role): boolean {
  if (!user) return false
  return RANK[user.role] >= RANK[minimum]
}
