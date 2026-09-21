import {
  IconCalendarEvent,
  IconLayoutDashboard,
  IconTrophy,
  IconUsers,
  IconWeight,
} from '@tabler/icons-react'
import type { Role } from '@/entities/user'

export interface NavItem {
  to: string
  label: string
  icon: typeof IconLayoutDashboard
  /** Hidden from the sidebar when the signed-in user is below this role. */
  minimumRole?: Role
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { to: '/athletes', label: 'Athletes', icon: IconUsers, minimumRole: 'editor' },
  { to: '/events', label: 'Events', icon: IconCalendarEvent, minimumRole: 'editor' },
  { to: '/rankings', label: 'Rankings', icon: IconTrophy, minimumRole: 'editor' },
  { to: '/divisions', label: 'Divisions', icon: IconWeight, minimumRole: 'editor' },
]
