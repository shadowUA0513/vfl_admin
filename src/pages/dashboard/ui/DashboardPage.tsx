import { Box, Stack, Title } from '@mantine/core'
import { useSessionStore } from '@/entities/session'

export function DashboardPage() {
  const user = useSessionStore((state) => state.user)

  return (
    <Stack gap={44}>
      <Box>
        <Title order={1}>{user?.name ?? 'Dashboard'}</Title>
        <Box className="vfl-rule" mt={18} style={{ maxWidth: 64 }} />
      </Box>
    </Stack>
  )
}
