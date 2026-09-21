import { Button, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { divisionKindLabel, divisionQueries, type Division } from '@/entities/division'
import { ConfirmDialog, DataTable, PageHeader, type Column } from '@/shared/ui'

const COLUMNS: Array<Column<Division>> = [
  {
    key: 'name',
    header: 'Division',
    render: (division) => (
      <Text fz={14} c="var(--vfl-white)">
        {division.name}
      </Text>
    ),
  },
  {
    key: 'kind',
    header: 'Kind',
    render: (division) => (
      <Text fz={14} c="var(--vfl-gray)">
        {divisionKindLabel(division.kind)}
      </Text>
    ),
  },
  {
    key: 'weight_limit_lbs',
    header: 'Weight Limit',
    render: (division) => (
      <Text className="vfl-numeric" fz={14}>
        {division.weight_limit_lbs ? `${division.weight_limit_lbs} lbs` : '—'}
      </Text>
    ),
  },
  {
    key: 'gender',
    header: 'Gender',
    render: (division) => <Text className="vfl-label">{division.gender}</Text>,
  },
]

export function DivisionsListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = divisionQueries.useList()
  const remove = divisionQueries.useRemove()
  const [pendingRemoval, setPendingRemoval] = useState<Division | null>(null)

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/divisions/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={36}>
      <PageHeader title="Divisions" action={createButton} />

      <DataTable
        columns={COLUMNS}
        rows={data}
        isLoading={isLoading}
        error={error}
        errorMessage="Could not load divisions."
        emptyTitle="No Divisions"
        emptyBody="Divisions are the weight classes athletes are organised by."
        emptyAction={createButton}
        onEdit={(division) => navigate(`/divisions/${division.id}/edit`)}
        onRemove={setPendingRemoval}
        removingId={remove.isPending ? pendingRemoval?.id : null}
      />

      <ConfirmDialog
        opened={pendingRemoval !== null}
        title="Remove Division"
        body={`Remove ${pendingRemoval?.name ?? 'this division'}? Athletes assigned to it keep the name as plain text.`}
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
