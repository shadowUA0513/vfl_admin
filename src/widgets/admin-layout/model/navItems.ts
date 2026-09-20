import {
  IconCalendarEvent,
  IconLayoutDashboard,
  IconPalette,
  IconUsers,
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
  { to: '/events', label: 'Events', icon: IconCalendarEvent, minimumRole: 'editor' },
  { to: '/fighters', label: 'Fighters', icon: IconUsers, minimumRole: 'editor' },
  { to: '/design-system', label: 'Design System', icon: IconPalette },
]
