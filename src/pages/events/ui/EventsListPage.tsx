import { Button, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { eventQueries, type VflEvent } from '@/entities/event'
import {
  ConfirmDialog,
  DataTable,
  ListPagination,
  PAGE_SIZE,
  PageHeader,
  type Column,
} from '@/shared/ui'

function statusColor(status: VflEvent['status']) {
  if (status === 'cancelled') return 'var(--vfl-red-bright)'
  if (status === 'scheduled') return 'var(--vfl-white-soft)'
  return 'var(--vfl-gray-muted)'
}

/* starts_at is an RFC3339 timestamp; rendering it in the viewer's locale
   keeps the column readable without pulling in a date library. */
function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const COLUMNS: Array<Column<VflEvent>> = [
  {
    key: 'name',
    header: 'Event',
    render: (event) => (
      <Text fz={14} c="var(--vfl-white)">
        {event.name}
      </Text>
    ),
  },
  {
    key: 'starts_at',
    header: 'Starts',
    render: (event) => (
      <Text className="vfl-numeric" fz={14}>
        {formatDate(event.starts_at)}
      </Text>
    ),
  },
  { key: 'venue', header: 'Venue', render: (event) => event.venue_name || '—' },
  { key: 'city', header: 'City', render: (event) => event.city || '—' },
  {
    key: 'status',
    header: 'Status',
    render: (event) => (
      <Text className="vfl-label" c={statusColor(event.status)}>
        {event.status ?? '—'}
      </Text>
    ),
  },
]

export function EventsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = eventQueries.useListPage({ page, limit: PAGE_SIZE })
  const remove = eventQueries.useRemove()
  const [pendingRemoval, setPendingRemoval] = useState<VflEvent | null>(null)

  /* Deleting the last row on a page would otherwise leave it empty with no
     way back but the pager. */
  const stepBackIfEmptied = () => {
    if (data?.rows.length === 1 && page > 1) setPage(page - 1)
  }

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/events/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={36}>
      <PageHeader title="Events" action={createButton} />

      <DataTable
        columns={COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        error={error}
        errorMessage="Could not load events."
        emptyTitle="No Events"
        emptyBody="Create the first event to start the calendar."
        emptyAction={createButton}
        onEdit={(event) => navigate(`/events/${event.id}/edit`)}
        onRemove={setPendingRemoval}
        removingId={remove.isPending ? pendingRemoval?.id : null}
      />

      <ListPagination meta={data?.meta} page={page} onPageChange={setPage} />

      <ConfirmDialog
        opened={pendingRemoval !== null}
        title="Remove Event"
        body={`Remove ${pendingRemoval?.name ?? 'this event'}? This cannot be undone.`}
        loading={remove.isPending}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (!pendingRemoval) return
          remove.mutate(pendingRemoval.id, {
            onSuccess: stepBackIfEmptied,
            onSettled: () => setPendingRemoval(null),
          })
        }}
      />
    </Stack>
  )
}
