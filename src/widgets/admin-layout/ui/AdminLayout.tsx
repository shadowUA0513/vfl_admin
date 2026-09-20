import { Box, Burger, Button, Drawer, Group, Menu, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown, IconLogout } from '@tabler/icons-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { hasRole } from '@/entities/user'
import { useLogout } from '@/features/auth'
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

/** Shell for every signed-in screen: sidebar, top bar, and the routed page. */
export function AdminLayout() {
  const user = useSessionStore((state) => state.user)
  const logout = useLogout()
  const [drawerOpen, drawer] = useDisclosure(false)
  const location = useLocation()

  const current = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))

  return (
    <Box className={classes.root}>
      <aside className={classes.sidebar}>
        <Brand />
        <NavItems />
      </aside>

      {/* Below the sidebar breakpoint the same nav moves into a drawer. */}
      <Drawer
        opened={drawerOpen}
        onClose={drawer.close}
        size={260}
        withCloseButton={false}
        classNames={{ content: classes.drawer, body: classes.drawerBody }}
      >
        <Brand />
        <NavItems onNavigate={drawer.close} />
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
            <Text className="vfl-label">{current?.label ?? 'VFL Admin'}</Text>
          </Group>

          <Menu position="bottom-end" width={200}>
            <Menu.Target>
              <Button variant="subtle" rightSection={<IconChevronDown size={14} />}>
                {user?.name ?? 'Account'}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Box className={classes.menuHead}>
                <Text fz={13} c="var(--vfl-white-soft)">
                  {user?.email}
                </Text>
                <Text className="vfl-label" mt={4}>
                  {user?.role}
                </Text>
              </Box>
              <Menu.Item leftSection={<IconLogout size={15} />} onClick={logout}>
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </header>

        <Box component="main" className={classes.content} key={location.pathname}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
