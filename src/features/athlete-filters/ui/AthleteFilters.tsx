import { ActionIcon, Box, Group, Select, Text, TextInput } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'
import { ATHLETE_STATUSES } from '@/entities/athlete'
import type { Division } from '@/entities/division'
import { EMPTY_ATHLETE_FILTERS, hasActiveFilters, type AthleteFilterState } from '../model/types'
import classes from './AthleteFilters.module.css'

interface AthleteFiltersProps {
  value: AthleteFilterState
  onChange: (next: AthleteFilterState) => void
  divisions: Division[]
  /** Rows currently shown, so the bar can say what the filters did. */
  resultCount?: number
  /** True while a changed filter is still fetching. */
  busy?: boolean
}

/* A weight class is identified by its limit as much as by its name — "135"
   is how a matchmaker thinks about bantamweight. Pound-for-pound boards
   have no limit, so they fall back to the name alone. */
function divisionLabel(division: Division): string {
  return division.weight_limit_lbs
    ? `${division.name} · ${division.weight_limit_lbs} lb`
    : division.name
}

export function AthleteFilters({
  value,
  onChange,
  divisions,
  resultCount,
  busy,
}: AthleteFiltersProps) {
  const active = hasActiveFilters(value)

  const set = (patch: Partial<AthleteFilterState>) => onChange({ ...value, ...patch })

  /* Lightest divisions first, so the list reads like a weight ladder rather
     than in whatever order the API returned. Anything without a limit sorts
     to the end by name. */
  const sorted = [...divisions].sort((a, b) => {
    const aLimit = a.weight_limit_lbs ?? Number.POSITIVE_INFINITY
    const bLimit = b.weight_limit_lbs ?? Number.POSITIVE_INFINITY
    return aLimit - bLimit || a.name.localeCompare(b.name)
  })

  return (
    <Box className={classes.bar} data-busy={busy || undefined}>
      <Group gap={14} align="flex-end" wrap="wrap">
        <TextInput
          placeholder="Search by name or nickname"
          leftSection={<IconSearch size={15} />}
          value={value.search}
          onChange={(event) => set({ search: event.currentTarget.value })}
          aria-label="Search athletes"
          className={classes.search}
          rightSection={
            value.search ? (
              <ActionIcon
                variant="subtle"
                size={22}
                radius={0}
                aria-label="Clear search"
                onClick={() => set({ search: '' })}
              >
                <IconX size={13} />
              </ActionIcon>
            ) : null
          }
        />

        <Select
          placeholder="All weight classes"
          data={sorted.map((division) => ({
            value: division.id,
            label: divisionLabel(division),
          }))}
          value={value.divisionId}
          onChange={(next) => set({ divisionId: next })}
          searchable
          clearable
          aria-label="Filter by weight class"
          className={classes.select}
        />

        <Select
          placeholder="Any status"
          data={ATHLETE_STATUSES.map((status) => ({
            value: status,
            /* The API's own lowercase values, shown the way the rest of the
               admin shows them. */
            label: status.charAt(0).toUpperCase() + status.slice(1),
          }))}
          value={value.status}
          onChange={(next) => set({ status: next })}
          clearable
          aria-label="Filter by status"
          className={classes.statusSelect}
        />

        {active && (
          <ActionIcon
            variant="subtle"
            size={36}
            radius={0}
            aria-label="Clear all filters"
            className={classes.clear}
            onClick={() => onChange(EMPTY_ATHLETE_FILTERS)}
          >
            <IconX size={16} />
          </ActionIcon>
        )}
      </Group>

      {/* Only shown once something is filtered: on an unfiltered list the
          count is just the number of cards below it. */}
      {active && resultCount !== undefined && (
        <Text fz={12} c="var(--vfl-gray-muted)" className={classes.count}>
          {resultCount === 0
            ? 'No athletes match these filters'
            : `${resultCount} ${resultCount === 1 ? 'athlete' : 'athletes'}`}
        </Text>
      )}
    </Box>
  )
}
