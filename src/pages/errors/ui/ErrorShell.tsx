import { Box, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './ErrorPages.module.css'

interface ErrorShellProps {
  code: string
  title: string
  body: string
  action: ReactNode
}

/** Shared layout for the error screens in this slice. */
export function ErrorShell({ code, title, body, action }: ErrorShellProps) {
  return (
    <Box className={classes.root}>
      <Stack gap={0} align="flex-start" maw={480}>
        <Text className={`vfl-display vfl-numeric ${classes.code}`}>{code}</Text>
        <Box className="vfl-rule" style={{ maxWidth: 64 }} />
        <Text className={`vfl-display ${classes.title}`}>{title}</Text>
        <Text c="var(--vfl-gray)" fz={15} mt={16} mb={32}>
          {body}
        </Text>
        {action}
      </Stack>
    </Box>
  )
}
