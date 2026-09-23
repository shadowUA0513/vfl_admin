import { Alert, Box, Button, Group, Paper } from '@mantine/core'
import type { FormEventHandler, ReactNode } from 'react'
import { apiErrorMessage } from '@/shared/api'
import classes from './FormShell.module.css'

interface FormShellProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
  submitLabel: string
  /** Blocks the form body while an edit page loads the existing record. */
  loading?: boolean
  saving?: boolean
  error?: unknown
  /* Most forms are a single column of fields and read best narrow. The
     event form is the exception: its fight card puts two fighter pickers
     side by side, which needs the room. */
  maw?: number | string
  children: ReactNode
}

/** Panel, error slot and action bar shared by every create and edit page. */
export function FormShell({
  onSubmit,
  onCancel,
  submitLabel,
  loading,
  saving,
  error,
  maw = 680,
  children,
}: FormShellProps) {
  return (
    <Paper data-accent p="var(--vfl-pad-panel-lg)" maw={maw} className={classes.root}>
      <form onSubmit={onSubmit} noValidate>
        {Boolean(error) && (
          <Alert variant="outline" color="vflRed" radius={0} mb={28} classNames={{ root: classes.alert }}>
            {apiErrorMessage(error, 'Could not save these changes.')}
          </Alert>
        )}

        <Box className={loading ? classes.loading : undefined}>{children}</Box>

        <Group justify="flex-end" gap={12} mt={40} pt={28} className={classes.actions}>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={loading}>
            {submitLabel}
          </Button>
        </Group>
      </form>
    </Paper>
  )
}
