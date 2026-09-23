import { Box, Paper, Text } from '@mantine/core'
import type { Athlete } from '@/entities/athlete'
import classes from './RecordReadout.module.css'

interface RecordReadoutProps {
  /** Absent on the create page, and while an edit page is still fetching. */
  athlete?: Athlete
}

const TALLIES = [
  { key: 'wins', label: 'Wins' },
  { key: 'losses', label: 'Losses' },
  { key: 'draws', label: 'Draws' },
  { key: 'no_contests', label: 'No Contests' },
] as const

const BREAKDOWN = [
  { label: 'By KO/TKO', win: 'wins_by_ko', loss: 'losses_by_ko' },
  { label: 'By Submission', win: 'wins_by_submission', loss: 'losses_by_submission' },
  { label: 'By Decision', win: 'wins_by_decision', loss: 'losses_by_decision' },
] as const

/**
 * The win/loss record, shown but not editable.
 *
 * `wins`, `losses`, `draws` and the method breakdown are on model.Athlete but
 * on neither dto.CreateAthleteRequest nor dto.UpdateAthleteRequest — the API
 * derives them from bout results and from legacy fight entries
 * (POST /admin/athletes/{id}/legacy-fights). A number box here would accept
 * a figure the server then discards, so the panel states where the numbers
 * come from instead.
 */
export function RecordReadout({ athlete }: RecordReadoutProps) {
  if (!athlete) {
    return (
      <Paper p="var(--vfl-pad-panel)" bg="var(--vfl-bg-soft)">
        <Text c="var(--vfl-gray)" fz={13}>
          A record appears once the fighter has results. It is compiled from bout results and
          legacy fight history, not entered here.
        </Text>
      </Paper>
    )
  }

  return (
    <Paper p={0} bg="var(--vfl-bg-soft)">
      <Box className={classes.tallies}>
        {TALLIES.map((tally) => (
          <Box key={tally.key} className={classes.tally}>
            <Text className="vfl-label">{tally.label}</Text>
            <Text className={`vfl-display vfl-numeric ${classes.value}`}>
              {athlete[tally.key] ?? 0}
            </Text>
          </Box>
        ))}
      </Box>

      <Box className={classes.breakdown}>
        {BREAKDOWN.map((row) => (
          <Box key={row.label} className={classes.breakdownRow}>
            <Text className="vfl-label">{row.label}</Text>
            <Text className={`vfl-numeric ${classes.split}`}>
              {athlete[row.win] ?? 0}
              <span className={classes.splitKey}>W</span>
              {athlete[row.loss] ?? 0}
              <span className={classes.splitKey}>L</span>
            </Text>
          </Box>
        ))}
      </Box>

      <Text className={classes.note}>
        Compiled by the API from bout results and legacy fight history — read-only here.
      </Text>
    </Paper>
  )
}
