import { Button, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AthleteCard, athleteName, athleteQueries, type Athlete } from '@/entities/athlete'
import { divisionQueries } from '@/entities/division'
import { ConfirmDialog, PageHeader } from '@/shared/ui'
import classes from './AthletesListPage.module.css'

export function AthletesListPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = athleteQueries.useList()
  const remove = athleteQueries.useRemove()

  /* Athletes carry division_id, not a division name, so the divisions list
     is fetched alongside to label each card. */
  const { data: divisions } = divisionQueries.useList()
  const divisionById = new Map((divisions ?? []).map((division) => [division.id, division]))

  const [pendingRemoval, setPendingRemoval] = useState<Athlete | null>(null)

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/athletes/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={36}>
      <PageHeader title="Athletes" action={createButton} />

      {isLoading && (
        /* Card-shaped skeletons so the layout does not jump when data lands. */
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={20}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={320} radius={0} />
          ))}
        </SimpleGrid>
      )}

      {Boolean(error) && !isLoading && (
        <Paper data-accent p="var(--vfl-pad-panel)">
          <Text className="vfl-label" c="var(--vfl-red-bright)" mb={10}>
            Error
          </Text>
          <Text c="var(--vfl-gray)" fz={14}>
            Could not load athletes.
          </Text>
        </Paper>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <Paper p="var(--vfl-pad-panel-lg)">
          <Text className={`vfl-display ${classes.emptyTitle}`}>No Athletes</Text>
          <Text c="var(--vfl-gray)" fz={14} mt={12} mb={28}>
            Add the first athlete to start building the roster.
          </Text>
          {createButton}
        </Paper>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={20}>
          {data.map((athlete) => {
            const division = athlete.division_id ? divisionById.get(athlete.division_id) : undefined
            return (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                divisionName={division?.name}
                weightLimitLbs={division?.weight_limit_lbs}
                onEdit={() => navigate(`/athletes/${athlete.id}/edit`)}
                onRemove={() => setPendingRemoval(athlete)}
                removing={remove.isPending && pendingRemoval?.id === athlete.id}
              />
            )
          })}
        </SimpleGrid>
      )}

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
