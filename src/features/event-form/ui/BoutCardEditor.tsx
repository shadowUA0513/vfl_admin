import { Box, Button, Group, Text } from '@mantine/core'
import { IconLayoutList } from '@tabler/icons-react'
import { useState } from 'react'
import { athleteName, athleteQueries } from '@/entities/athlete'
import { segmentLabel, type BoutDraft, type BoutSegment } from '@/entities/bout'
import { divisionQueries } from '@/entities/division'
import { FightCardModal } from './FightCardModal'
import classes from './FightCardModal.module.css'

interface BoutCardEditorProps {
  value: BoutDraft[]
  onChange: (bouts: BoutDraft[]) => void
  /** Per-bout messages keyed by draft key, produced on submit. */
  errors: Record<string, string>
}

/* The event form's window onto the fight card: what is on it, and the way
   in. The card itself is built in the modal, which has the room for two
   fighter pickers side by side. */
export function BoutCardEditor({ value, onChange, errors }: BoutCardEditorProps) {
  const [opened, setOpened] = useState(false)
  const { data: athletes } = athleteQueries.useList()
  const { data: divisions } = divisionQueries.useList()

  const sortedAthletes = [...(athletes ?? [])].sort((a, b) =>
    athleteName(a).localeCompare(athleteName(b)),
  )
  const athletesById = new Map(sortedAthletes.map((athlete) => [athlete.id, athlete]))

  const summary = value.reduce((counts, draft) => {
    counts.set(draft.segment, (counts.get(draft.segment) ?? 0) + 1)
    return counts
  }, new Map<BoutSegment, number>())

  const problems = value.filter((draft) => errors[draft.key]).length

  return (
    <Box>
      <Group justify="space-between" align="flex-end" mb={12}>
        <Text className="vfl-label">Fight Card</Text>
        <Text fz={12} c="var(--vfl-gray-muted)">
          {value.length === 0
            ? 'No bouts'
            : `${value.length} ${value.length === 1 ? 'bout' : 'bouts'}`}
        </Text>
      </Group>

      <Group justify="space-between" wrap="wrap" gap={14} className={classes.summary}>
        <Box>
          <Text fz={14} c="var(--vfl-white)">
            {value.length === 0
              ? 'Nothing on the card yet'
              : [...summary]
                  .map(([segment, count]) => `${count} ${segmentLabel(segment)}`)
                  .join(' · ')}
          </Text>
          {problems > 0 && (
            <Text fz={12} c="var(--vfl-red-bright)" mt={4}>
              {problems === 1 ? '1 bout needs attention' : `${problems} bouts need attention`}
            </Text>
          )}
        </Box>

        <Button
          variant="outline"
          leftSection={<IconLayoutList size={15} />}
          onClick={() => setOpened(true)}
        >
          {value.length === 0 ? 'Add Bouts' : 'Edit Fight Card'}
        </Button>
      </Group>

      <FightCardModal
        opened={opened}
        onClose={() => setOpened(false)}
        value={value}
        onChange={onChange}
        errors={errors}
        athletes={sortedAthletes}
        athletesById={athletesById}
        divisions={divisions ?? []}
      />
    </Box>
  )
}
