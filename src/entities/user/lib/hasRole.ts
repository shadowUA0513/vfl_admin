import type { Role, User } from '../model/types'

/* Role ranking for route guards. A route declares the minimum role it needs
   and anything at or above that rank passes, so guards don't have to list
   every role explicitly. */
const RANK: Record<Role, number> = {
  editor: 0,
  super_admin: 1,
}

export function hasRole(user: User | null, minimum: Role): boolean {
  if (!user) return false
  /* An unknown role from the server ranks below everything, so a new role
     added API-side cannot silently inherit admin access here. */
  const rank = RANK[user.role] ?? -1
  return rank >= RANK[minimum]
}

/** Human-readable role for display. */
export function roleLabel(role: Role | undefined): string {
  if (role === 'super_admin') return 'Super Admin'
  if (role === 'editor') return 'Editor'
  return 'Unknown'
}
