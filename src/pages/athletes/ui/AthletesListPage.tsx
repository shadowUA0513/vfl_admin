import { Button, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AthleteCard, athleteName, athleteQueries, type Athlete } from '@/entities/athlete'
import { divisionQueries } from '@/entities/division'
import {
  AthleteFilters,
  EMPTY_ATHLETE_FILTERS,
  hasActiveFilters,
  type AthleteFilterState,
} from '@/features/athlete-filters'
import { ConfirmDialog, ListPagination, PAGE_SIZE, PageHeader } from '@/shared/ui'
import classes from './AthletesListPage.module.css'

export function AthletesListPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AthleteFilterState>(EMPTY_ATHLETE_FILTERS)
  /* The two selects apply on the click, but the search box would otherwise
     fire a request per keystroke. */
  const [debouncedSearch] = useDebouncedValue(filters.search, 300)

  /* Filtering is the API's job: it supports search, division and status as
     query params, and the list is capped at one page, so narrowing it here
     would only ever search what that page happened to contain. */
  const { data, isLoading, isFetching, error } = athleteQueries.useListPage({
    search: debouncedSearch.trim(),
    division_id: filters.divisionId ?? undefined,
    status: filters.status ?? undefined,
    page,
    limit: PAGE_SIZE,
  })

  const athletes = data?.rows

  /* Narrowing the list invalidates whatever page you were on — page 3 of an
     unfiltered roster is rarely page 3 of the filtered one, and is often
     past the end of it. */
  const applyFilters = (next: AthleteFilterState) => {
    setFilters(next)
    setPage(1)
  }

  /* Deleting the last row on a page would otherwise leave it empty with no
     way back but the pager. */
  const stepBackIfEmptied = () => {
    if (athletes?.length === 1 && page > 1) setPage(page - 1)
  }

  const remove = athleteQueries.useRemove()

  /* Athletes carry division_id, not a division name, so the divisions list
     is fetched alongside to label each card. */
  const { data: divisions } = divisionQueries.useList()
  const divisionById = new Map((divisions ?? []).map((division) => [division.id, division]))

  const [pendingRemoval, setPendingRemoval] = useState<Athlete | null>(null)

  const filtered = hasActiveFilters(filters)
  /* An empty list means two different things — nothing on the roster, or
     nothing matching — and they need different screens. */
  const empty = !isLoading && !error && athletes?.length === 0

  const createButton = (
    <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/athletes/new')}>
      Create
    </Button>
  )

  return (
    <Stack gap={28}>
      <PageHeader title="Athletes" action={createButton} />

      <AthleteFilters
        value={filters}
        onChange={applyFilters}
        divisions={divisions ?? []}
        resultCount={data?.meta.total}
        busy={isFetching && !isLoading}
      />

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

      {empty && filtered && (
        <Paper p="var(--vfl-pad-panel-lg)">
          <Text className={`vfl-display ${classes.emptyTitle}`}>No Matches</Text>
          <Text c="var(--vfl-gray)" fz={14} mt={12} mb={28}>
            No athlete matches the current search and filters.
          </Text>
          <Button variant="outline" onClick={() => applyFilters(EMPTY_ATHLETE_FILTERS)}>
            Clear Filters
          </Button>
        </Paper>
      )}

      {empty && !filtered && (
        <Paper p="var(--vfl-pad-panel-lg)">
          <Text className={`vfl-display ${classes.emptyTitle}`}>No Athletes</Text>
          <Text c="var(--vfl-gray)" fz={14} mt={12} mb={28}>
            Add the first athlete to start building the roster.
          </Text>
          {createButton}
        </Paper>
      )}

      {!isLoading && !error && athletes && athletes.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={20}>
          {athletes.map((athlete) => {
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

      <ListPagination meta={data?.meta} page={page} onPageChange={setPage} />

      <ConfirmDialog
        opened={pendingRemoval !== null}
        title="Remove Athlete"
        body={`Remove ${pendingRemoval ? athleteName(pendingRemoval) : 'this athlete'}? This cannot be undone.`}
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
