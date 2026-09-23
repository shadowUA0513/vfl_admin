import { Box, Button, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  RankingCard,
  rankingQueries,
  usePublishRanking,
  type RankingSnapshot,
} from '@/entities/ranking'
import { ConfirmDialog, PageHeader } from '@/shared/ui'
import classes from './RankingsListPage.module.css'

/* Drafts first, then published, each alphabetical by division: the boards
   that still need a decision sit at the top of the grid. */
function sortSnapshots(rows: RankingSnapshot[]): RankingSnapshot[] {
  return [...rows].sort((a, b) => {
    const aDraft = a.status !== 'published'
    const bDraft = b.status !== 'published'
    if (aDraft !== bDraft) return aDraft ? -1 : 1
    return (a.division?.name ?? '').localeCompare(b.division?.name ?? '')
  })
}

export function RankingsListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = rankingQueries.useList()
  const remove = rankingQueries.useRemove()
  const publish = usePublishRanking()

  const [pendingRemoval, setPendingRemoval] = useState<RankingSnapshot | null>(null)
  const [pendingPublish, setPendingPublish] = useState<RankingSnapshot | null>(null)

  const snapshots = data ? sortSnapshots(data) : []
  const publishedCount = snapshots.filter((row) => row.status === 'published').length
  const draftCount = snapshots.length - publishedCount

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/rankings/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={36}>
      <PageHeader title="Rankings" action={createButton} />

      {isLoading && (
        <>
          <Skeleton height={104} radius={0} />
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={20}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={300} radius={0} />
            ))}
          </SimpleGrid>
        </>
      )}

      {Boolean(error) && !isLoading && (
        <Paper data-accent p="var(--vfl-pad-panel)">
          <Text className="vfl-label" c="var(--vfl-red-bright)" mb={10}>
            Error
          </Text>
          <Text c="var(--vfl-gray)" fz={14}>
            Could not load rankings.
          </Text>
        </Paper>
      )}

      {!isLoading && !error && snapshots.length === 0 && (
        <Paper p="var(--vfl-pad-panel-lg)">
          <Text className={`vfl-display ${classes.emptyTitle}`}>No Rankings</Text>
          <Text c="var(--vfl-gray)" fz={14} maw={420} mt={12} mb={28}>
            A ranking is one division: a champion plus ranked contenders.
          </Text>
          {createButton}
        </Paper>
      )}

      {!isLoading && !error && snapshots.length > 0 && (
        <>
          <Box className={`${classes.summary} vfl-enter`}>
            <Box className={classes.stat}>
              <Text className="vfl-label">Divisions Ranked</Text>
              <Text className={`vfl-display vfl-numeric ${classes.statValue}`}>
                {snapshots.length}
              </Text>
            </Box>
            <Box className={classes.stat}>
              <Text className="vfl-label">Published</Text>
              <Text className={`vfl-display vfl-numeric ${classes.statValue}`}>
                {publishedCount}
              </Text>
            </Box>
            <Box className={classes.stat}>
              <Text className="vfl-label">Awaiting Publish</Text>
              <Text
                className={`vfl-display vfl-numeric ${classes.statValue}`}
                data-pending={draftCount > 0 || undefined}
              >
                {draftCount}
              </Text>
            </Box>
          </Box>

          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={20}>
            {snapshots.map((snapshot) => (
              <RankingCard
                key={snapshot.id}
                snapshot={snapshot}
                onEdit={() => navigate(`/rankings/${snapshot.id}/edit`)}
                onRemove={() => setPendingRemoval(snapshot)}
                onPublish={() => setPendingPublish(snapshot)}
                removing={remove.isPending && pendingRemoval?.id === snapshot.id}
                publishing={publish.isPending && pendingPublish?.id === snapshot.id}
              />
            ))}
          </SimpleGrid>
        </>
      )}

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
