import { Box, Button, Group, Text, Title } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import classes from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  /** Optional eyebrow. Left out on most pages — the sidebar already says
   *  which section you are in, so repeating it here is noise. */
  label?: string
  /** Primary action, usually the Create button. */
  action?: ReactNode
  /** Shows a back link above the title, pointing at this route. */
  backTo?: string
  /** Section name only — the arrow already means "back". */
  backLabel?: string
}

export function PageHeader({ title, label, action, backTo, backLabel }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <Box className={classes.root}>
      {backTo && (
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={15} />}
          className={classes.back}
          /* Navigates to the list route rather than calling history.back():
             arriving here from a bookmark or a page reload leaves nothing
             sensible to go back to. */
          onClick={() => navigate(backTo)}
        >
          {backLabel ?? 'Back'}
        </Button>
      )}

      <Group justify="space-between" align="flex-end" wrap="nowrap" gap={20}>
        <Box miw={0}>
          {label && (
            <Text className="vfl-label" mb={12}>
              {label}
            </Text>
          )}
          <Title order={1}>{title}</Title>
        </Box>
        {action}
      </Group>
      <Box className="vfl-rule" mt={18} style={{ maxWidth: 64 }} />
    </Box>
  )
}
