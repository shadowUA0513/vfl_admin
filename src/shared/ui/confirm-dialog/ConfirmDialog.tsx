import { Button, Group, Modal, Text } from '@mantine/core'

interface ConfirmDialogProps {
  opened: boolean
  title: string
  body: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Destructive-action gate. Nothing in the admin deletes without one. */
export function ConfirmDialog({
  opened,
  title,
  body,
  confirmLabel = 'Remove',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} size={460}>
      <Text c="var(--vfl-gray)" fz={14} mb={32}>
        {body}
      </Text>
      <Group justify="flex-end" gap={12}>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  )
}
