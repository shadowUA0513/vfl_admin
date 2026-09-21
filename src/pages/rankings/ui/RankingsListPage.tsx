import { Button, Group, Stack, Text } from '@mantine/core'
import { IconPlus, IconSend } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { athleteName } from '@/entities/athlete'
import {
  championLabelText,
  rankingQueries,
  usePublishRanking,
  type RankingSnapshot,
} from '@/entities/ranking'
import { ConfirmDialog, DataTable, PageHeader, type Column } from '@/shared/ui'

function statusColor(status: RankingSnapshot['status']) {
  return status === 'published' ? 'var(--vfl-white-soft)' : 'var(--vfl-gray-muted)'
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function RankingsListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = rankingQueries.useList()
  const remove = rankingQueries.useRemove()
  const publish = usePublishRanking()

  const [pendingRemoval, setPendingRemoval] = useState<RankingSnapshot | null>(null)
  const [pendingPublish, setPendingPublish] = useState<RankingSnapshot | null>(null)

  const columns: Array<Column<RankingSnapshot>> = [
    {
      key: 'division',
      header: 'Division',
      render: (snapshot) => (
        <Text fz={14} c="var(--vfl-white)">
          {snapshot.division?.name ?? '—'}
        </Text>
      ),
    },
    {
      key: 'champion',
      header: 'Champion',
      render: (snapshot) => (
        <div>
          <Text fz={14}>{snapshot.champion ? athleteName(snapshot.champion) : '—'}</Text>
          <Text fz={12} c="var(--vfl-gray-muted)">
            {championLabelText(snapshot.champion_label)}
          </Text>
        </div>
      ),
    },
    /* No entry-count column: GET /admin/rankings returns `entries: null` on
       every row — only the detail endpoint populates them. A count here
       would read 0 for every snapshot regardless of its real size. */
    {
      key: 'notes',
      header: 'Notes',
      render: (snapshot) => (
        <Text fz={13} c="var(--vfl-gray)" lineClamp={1}>
          {snapshot.notes || '—'}
        </Text>
      ),
    },
    {
      key: 'published_at',
      header: 'Published',
      render: (snapshot) => (
        <Text className="vfl-numeric" fz={14}>
          {formatDate(snapshot.published_at)}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (snapshot) => (
        <Group gap={10} wrap="nowrap">
          <Text className="vfl-label" c={statusColor(snapshot.status)}>
            {snapshot.status ?? 'draft'}
          </Text>
          {snapshot.status !== 'published' && (
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<IconSend size={13} />}
              onClick={() => setPendingPublish(snapshot)}
            >
              Publish
            </Button>
          )}
        </Group>
      ),
    },
  ]

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/rankings/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={36}>
      <PageHeader title="Rankings" action={createButton} />

      <DataTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        error={error}
        errorMessage="Could not load rankings."
        emptyTitle="No Rankings"
        emptyBody="A ranking is one division: a champion plus ranked contenders."
        emptyAction={createButton}
        onEdit={(snapshot) => navigate(`/rankings/${snapshot.id}/edit`)}
        onRemove={setPendingRemoval}
        removingId={remove.isPending ? pendingRemoval?.id : null}
      />

      <ConfirmDialog
        opened={pendingRemoval !== null}
        title="Remove Ranking"
        body={`Remove the ${pendingRemoval?.division?.name ?? ''} ranking and all its entries?`}
        loading={remove.isPending}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          if (!pendingRemoval) return
          remove.mutate(pendingRemoval.id, { onSettled: () => setPendingRemoval(null) })
        }}
      />

      <ConfirmDialog
        opened={pendingPublish !== null}
        title="Publish Ranking"
        confirmLabel="Publish"
        body={`Publish the ${pendingPublish?.division?.name ?? ''} ranking to the public site?`}
        loading={publish.isPending}
        onCancel={() => setPendingPublish(null)}
        onConfirm={() => {
          if (!pendingPublish) return
          publish.mutate(pendingPublish.id, { onSettled: () => setPendingPublish(null) })
        }}
      />
    </Stack>
  )
}
