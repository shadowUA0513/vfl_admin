import { Button, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { athleteName, athleteQueries, formatRecord, type Athlete } from '@/entities/athlete'
import { divisionQueries } from '@/entities/division'
import { ConfirmDialog, DataTable, PageHeader, type Column } from '@/shared/ui'

function statusColor(status: Athlete['status']) {
  if (status === 'active') return 'var(--vfl-white-soft)'
  if (status === 'retired') return 'var(--vfl-red-bright)'
  return 'var(--vfl-gray-muted)'
}

export function AthletesListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = athleteQueries.useList()
  const remove = athleteQueries.useRemove()

  /* Athletes carry division_id, not a division name, so the divisions list
     is fetched alongside to label the column. */
  const { data: divisions } = divisionQueries.useList()
  const divisionName = (id: string | undefined) =>
    divisions?.find((division) => division.id === id)?.name ?? '—'

  const [pendingRemoval, setPendingRemoval] = useState<Athlete | null>(null)

  const columns: Array<Column<Athlete>> = [
    {
      key: 'name',
      header: 'Athlete',
      render: (athlete) => (
        <div>
          <Text fz={14} c="var(--vfl-white)">
            {athleteName(athlete)}
          </Text>
          {athlete.nickname && (
            <Text fz={12} c="var(--vfl-gray-muted)">
              &ldquo;{athlete.nickname}&rdquo;
            </Text>
          )}
        </div>
      ),
    },
    {
      key: 'division',
      header: 'Division',
      render: (athlete) => divisionName(athlete.division_id),
    },
    { key: 'country', header: 'Country', render: (athlete) => athlete.country || '—' },
    {
      key: 'record',
      header: 'Record',
      render: (athlete) => (
        <Text className="vfl-numeric" fz={14}>
          {formatRecord(athlete)}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (athlete) => (
        <Text className="vfl-label" c={statusColor(athlete.status)}>
          {athlete.status ?? '—'}
        </Text>
      ),
    },
  ]

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/athletes/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={36}>
      <PageHeader title="Athletes" action={createButton} />

      <DataTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        error={error}
        errorMessage="Could not load athletes."
        emptyTitle="No Athletes"
        emptyBody="Add the first athlete to start building the roster."
        emptyAction={createButton}
        onEdit={(athlete) => navigate(`/athletes/${athlete.id}/edit`)}
        onRemove={setPendingRemoval}
        removingId={remove.isPending ? pendingRemoval?.id : null}
      />

      <ConfirmDialog
        opened={pendingRemoval !== null}
        title="Remove Athlete"
        body={`Remove ${pendingRemoval ? athleteName(pendingRemoval) : 'this athlete'}? This cannot be undone.`}
        loading={remove.isPending}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (!pendingRemoval) return
          remove.mutate(pendingRemoval.id, { onSettled: () => setPendingRemoval(null) })
        }}
      />
    </Stack>
  )
}
