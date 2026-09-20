import { Box, Paper, Stack, Text, Title } from '@mantine/core'

interface PlaceholderPageProps {
  label: string
  title: string
  description: string
}

/**
 * Stand-in body for routes that exist so the guards and navigation can be
 * exercised end to end, before the real screens are built.
 */
export function PlaceholderPage({ label, title, description }: PlaceholderPageProps) {
  return (
    <Stack gap={36}>
      <Box>
        <Text className="vfl-label" mb={12}>
          {label}
        </Text>
        <Title order={1}>{title}</Title>
        <Box className="vfl-rule" mt={18} style={{ maxWidth: 64 }} />
      </Box>

      <Paper p="var(--vfl-pad-panel)">
        <Text c="var(--vfl-gray)" fz={14} maw={620}>
          {description}
        </Text>
      </Paper>
    </Stack>
  )
}
