import { Box, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useSessionStore } from '@/entities/session'

const STATS = [
  { label: 'Active Fighters', value: '248' },
  { label: 'Events This Year', value: '17' },
  { label: 'Bouts Scheduled', value: '92' },
  { label: 'Pending Results', value: '6' },
]

export function DashboardPage() {
  const user = useSessionStore((state) => state.user)

  return (
    <Stack gap={44}>
      <Box>
        <Text className="vfl-label" mb={12}>
          Signed in as {user?.role}
        </Text>
        <Title order={1}>{user?.name ?? 'Dashboard'}</Title>
        <Box className="vfl-rule" mt={18} style={{ maxWidth: 64 }} />
      </Box>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing={20}>
        {STATS.map((stat, index) => (
          <Paper
            key={stat.label}
            data-accent
            p="var(--vfl-pad-panel)"
            className={`vfl-enter vfl-enter-${index + 1}`}
          >
            <Text className="vfl-label" mb={14}>
              {stat.label}
            </Text>
            <Text className="vfl-display vfl-numeric" fz={52}>
              {stat.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper p="var(--vfl-pad-panel)">
        <Text className="vfl-label" mb={12}>
          Placeholder
        </Text>
        <Text c="var(--vfl-gray)" fz={14} maw={620}>
          Figures above are static. Wire them to the API by adding a query in
          this slice's <code>api</code> segment — the axios client already
          attaches the session token, and a 401 anywhere returns the user to
          the login screen automatically.
        </Text>
      </Paper>
    </Stack>
  )
}
