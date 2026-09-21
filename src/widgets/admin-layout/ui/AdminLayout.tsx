import { Box, Burger, Button, Drawer, Group, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconLogout } from '@tabler/icons-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { hasRole } from '@/entities/user'
import { useLogout } from '@/features/auth'
import { ThemeToggle } from '@/shared/ui'
import { NAV_ITEMS } from '../model/navItems'
import classes from './AdminLayout.module.css'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const user = useSessionStore((state) => state.user)

  return (
    <nav className={classes.nav}>
      {NAV_ITEMS.filter((item) => !item.minimumRole || hasRole(user, item.minimumRole)).map(
        (item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink
              }
            >
              <Icon size={17} stroke={1.6} className={classes.navIcon} />
              <span>{item.label}</span>
            </NavLink>
          )
        },
      )}
    </nav>
  )
}

function Brand() {
  return (
    <Box className={classes.brand}>
      <Box className={classes.brandRow}>
        <Text className={`vfl-wordmark ${classes.brandMark}`}>VFL</Text>
        <Text className={`vfl-label ${classes.brandSub}`}>Admin</Text>
      </Box>
    </Box>
  )
}

interface SidebarFooterProps {
  onLogout: () => void
  signingOut: boolean
}

/** Pinned to the bottom of the sidebar: who you are, and the way out. */
function SidebarFooter({ onLogout, signingOut }: SidebarFooterProps) {
  const user = useSessionStore((state) => state.user)

  return (
    <Box className={classes.sidebarFooter}>
      <Box className={classes.account}>
        <Text fz={13} c="var(--vfl-white)" lh={1.25} truncate>
          {user?.name}
        </Text>
        <Text className="vfl-label" lh={1.25}>
          {user?.role}
        </Text>
      </Box>

      <Button
        variant="outline"
        fullWidth
        leftSection={<IconLogout size={15} />}
        onClick={onLogout}
        loading={signingOut}
      >
        Log out
      </Button>
    </Box>
  )
}

/** Shell for every signed-in screen: sidebar, top bar, and the routed page. */
export function AdminLayout() {
  const logout = useLogout()
  const [drawerOpen, drawer] = useDisclosure(false)
  const location = useLocation()

  /* Sign-out hits the API before clearing the session, so the button needs a
     pending state. It is never reset: a successful logout navigates away and
     unmounts this layout. */
  const [signingOut, setSigningOut] = useState(false)
  const handleLogout = () => {
    setSigningOut(true)
    void logout()
  }

  const current = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))

  return (
    <Box className={classes.root}>
      <aside className={classes.sidebar}>
        <Brand />
        <NavItems />
        <SidebarFooter onLogout={handleLogout} signingOut={signingOut} />
      </aside>

      {/* Below the sidebar breakpoint the same nav moves into a drawer —
          footer included, or there would be no way out on a phone. */}
      <Drawer
        opened={drawerOpen}
        onClose={drawer.close}
        size={260}
        withCloseButton={false}
        classNames={{ content: classes.drawer, body: classes.drawerBody }}
      >
        <Brand />
        <NavItems onNavigate={drawer.close} />
        <SidebarFooter onLogout={handleLogout} signingOut={signingOut} />
      </Drawer>

      <Box className={classes.main}>
        <header className={classes.topbar}>
          <Group gap={14}>
            <Burger
              opened={drawerOpen}
              onClick={drawer.toggle}
              size="sm"
              color="var(--vfl-white-soft)"
              className={classes.burger}
            />
            {/* Only below the sidebar breakpoint. On desktop the active
                nav item already names the page, and the page title says it
                a third time. */}
            <Text className={`vfl-label ${classes.topbarLabel}`}>
              {current?.label ?? 'VFL Admin'}
            </Text>
          </Group>

          <ThemeToggle />
        </header>

        <Box component="main" className={classes.content} key={location.pathname}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
