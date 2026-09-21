import { Box, Divider, Paper, Select, SimpleGrid, Stack, Text, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router'
import { athleteName, athleteQueries } from '@/entities/athlete'
import { divisionQueries } from '@/entities/division'
import { CHAMPION_LABELS, championLabelText, type RankingSnapshotInput } from '@/entities/ranking'
import { FormShell } from '@/shared/ui'
import { RankingEntriesEditor } from './RankingEntriesEditor'

interface RankingFormProps {
  initialValues?: RankingSnapshotInput
  /** Editing: the API has no division_id on its update DTO, so it is fixed. */
  divisionLocked?: boolean
  loading?: boolean
  saving?: boolean
  error?: unknown
  submitLabel: string
  onSubmit: (values: RankingSnapshotInput) => void
}

const EMPTY: RankingSnapshotInput = {
  division_id: '',
  entries: [],
  champion_id: '',
  champion_label: 'vacant',
  notes: '',
}

export function RankingForm({
  initialValues,
  divisionLocked,
  loading,
  saving,
  error,
  submitLabel,
  onSubmit,
}: RankingFormProps) {
  const navigate = useNavigate()
  const { data: divisions } = divisionQueries.useList()
  const { data: athletes } = athleteQueries.useList()

  const form = useForm<RankingSnapshotInput>({
    initialValues: initialValues ?? EMPTY,
    validate: {
      division_id: (value) => (value ? null : 'Pick a division'),
      champion_id: (value, values) =>
        /* A vacant title has no holder; any other label needs one. */
        values.champion_label !== 'vacant' && !value ? 'Pick a champion, or mark it vacant' : null,
    },
  })

  const isVacant = form.values.champion_label === 'vacant'

  /* Athletes assigned to the chosen division come first — a ranking almost
     always draws from its own division, but the API does not enforce that,
     so others stay selectable rather than hidden. */
  const divisionId = form.values.division_id
  const sortedAthletes = [...(athletes ?? [])].sort((a, b) => {
    const aIn = a.division_id === divisionId ? 0 : 1
    const bIn = b.division_id === divisionId ? 0 : 1
    return aIn - bIn || athleteName(a).localeCompare(athleteName(b))
  })

  const divisionName =
    divisions?.find((division) => division.id === form.values.division_id)?.name ?? '—'

  return (
    <FormShell
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          ...values,
          /* A vacant title must not carry a stale holder through. */
          champion_id: isVacant ? undefined : values.champion_id || undefined,
          notes: values.notes?.trim() || undefined,
          /* Rank is positional, so it is recomputed on the way out rather
             than trusted from whatever the editor last set. */
          entries: values.entries.map((entry, index) => ({
            athlete_id: entry.athlete_id,
            rank: index + 1,
          })),
        }),
      )}
      onCancel={() => navigate('/rankings')}
      submitLabel={submitLabel}
      loading={loading}
      saving={saving}
      error={error}
    >
      <Stack gap={22}>
        {divisionLocked ? (
          <Paper p={16} bg="var(--vfl-bg-soft)">
            <Text className="vfl-label" mb={6}>
              Division
            </Text>
            <Text fz={14} c="var(--vfl-white)">
              {divisionName}
            </Text>
          </Paper>
        ) : (
          <Select
            label="Division"
            placeholder="Select division"
            data={(divisions ?? []).map((division) => ({
              value: division.id,
              label: division.name,
            }))}
            searchable
            {...form.getInputProps('division_id')}
          />
        )}

        <Divider mt={8} />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <Select
            label="Title"
            data={CHAMPION_LABELS.map((label) => ({
              value: label,
              label: championLabelText(label),
            }))}
            allowDeselect={false}
            {...form.getInputProps('champion_label')}
          />
          <Select
            label="Champion"
            placeholder={isVacant ? 'Title is vacant' : 'Select champion'}
            data={sortedAthletes.map((athlete) => ({
              value: athlete.id,
              label: athleteName(athlete),
            }))}
            searchable
            clearable
            disabled={isVacant}
            {...form.getInputProps('champion_id')}
          />
        </SimpleGrid>

        <Divider mt={8} />

        <RankingEntriesEditor
          value={form.values.entries}
          onChange={(entries) => form.setFieldValue('entries', entries)}
          athletes={sortedAthletes}
          championId={isVacant ? undefined : form.values.champion_id}
          error={form.errors.entries as string | undefined}
        />

        <Box mt={8}>
          <Textarea
            label="Notes"
            placeholder="Optional"
            autosize
            minRows={3}
            {...form.getInputProps('notes')}
          />
        </Box>
      </Stack>
    </FormShell>
  )
}
