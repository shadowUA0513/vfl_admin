import { ActionIcon, Box, Group, Paper, Skeleton, Table, Text, Tooltip } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import classes from './DataTable.module.css'

export interface Column<T> {
  key: string
  header: string
  /** Cell contents. Return a string for plain text, or a node to style it. */
  render: (row: T) => ReactNode
  width?: number | string
  align?: 'left' | 'right'
}

interface DataTableProps<T extends { id: string }> {
  columns: Array<Column<T>>
  rows: T[] | undefined
  isLoading?: boolean
  error?: unknown
  errorMessage?: string
  /** Shown in place of the table when the resource has no records yet. */
  emptyTitle: string
  emptyBody: string
  emptyAction?: ReactNode
  onEdit: (row: T) => void
  onRemove: (row: T) => void
  /** Id currently being deleted, so its row can show the pending state. */
  removingId?: string | null
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading,
  error,
  errorMessage = 'Could not load this list.',
  emptyTitle,
  emptyBody,
  emptyAction,
  onEdit,
  onRemove,
  removingId,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Paper p={0}>
        <Box p="var(--vfl-pad-panel)">
          {/* Skeleton rows rather than a spinner: the table's shape stays on
              screen, so the layout doesn't jump when data lands. */}
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={22} radius={0} mb={16} />
          ))}
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper data-accent p="var(--vfl-pad-panel)">
        <Text className="vfl-label" c="var(--vfl-red-bright)" mb={10}>
          Error
        </Text>
        <Text c="var(--vfl-gray)" fz={14}>
          {errorMessage}
        </Text>
      </Paper>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <Paper p="var(--vfl-pad-panel-lg)" className={classes.empty}>
        <Text className={`vfl-display ${classes.emptyTitle}`}>{emptyTitle}</Text>
        <Text c="var(--vfl-gray)" fz={14} maw={420} mt={12} mb={emptyAction ? 28 : 0}>
          {emptyBody}
        </Text>
        {emptyAction}
      </Paper>
    )
  }

  return (
    <Paper p={0}>
      <Box className={classes.scroll}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  w={column.width}
                  ta={column.align === 'right' ? 'right' : undefined}
                >
                  {column.header}
                </Table.Th>
              ))}
              {/* Actions column: header left blank so it reads as chrome
                  rather than data. */}
              <Table.Th w={92} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.id} data-removing={removingId === row.id || undefined}>
                {columns.map((column) => (
                  <Table.Td
                    key={column.key}
                    ta={column.align === 'right' ? 'right' : undefined}
                  >
                    {column.render(row)}
                  </Table.Td>
                ))}
                <Table.Td>
                  {/* Icons, not labelled buttons: "Edit" and "Remove" on
                      every row is a wall of repeated words. The tooltip and
                      aria-label carry the meaning instead. */}
                  <Group gap={2} justify="flex-end" wrap="nowrap">
                    <Tooltip label="Edit" withArrow={false}>
                      <ActionIcon
                        variant="subtle"
                        size={30}
                        radius={0}
                        aria-label="Edit"
                        onClick={() => onEdit(row)}
                      >
                        <IconPencil size={15} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Remove" withArrow={false}>
                      <ActionIcon
                        variant="subtle"
                        size={30}
                        radius={0}
                        aria-label="Remove"
                        className={classes.removeButton}
                        onClick={() => onRemove(row)}
                        disabled={removingId === row.id}
                      >
                        <IconTrash size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  )
}
