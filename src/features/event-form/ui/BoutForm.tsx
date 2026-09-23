import { Box, Button, Checkbox, Group, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { athleteName, type Athlete } from '@/entities/athlete'
import {
  BOUT_SEGMENTS,
  SCHEDULED_ROUNDS,
  TITLE_FIGHT_ROUNDS,
  segmentLabel,
  type BoutDraft,
  type BoutSegment,
} from '@/entities/bout'
import type { Division } from '@/entities/division'
import classes from './FightCardModal.module.css'

interface BoutFormProps {
  draft: BoutDraft
  /** True when the draft is a bout already on the card. */
  editing: boolean
  athletes: Athlete[]
  divisions: Division[]
  /** Booked in the card's other bouts, so unavailable here. */
  bookedElsewhere: Set<string>
  onChange: (patch: Partial<BoutDraft>) => void
  onSubmit: () => void
  onCancel: () => void
}

interface CornerPickerProps {
  corner: 'red' | 'blue'
  value: string
  athletes: Athlete[]
  /** The other corner's fighter, plus anyone booked on another bout. */
  unavailable: Set<string>
  onChange: (athleteId: string) => void
}

/* The two corners are the same control twice over, differing only in which
   side of the card they sit on and what colour that side is. */
function CornerPicker({ corner, value, athletes, unavailable, onChange }: CornerPickerProps) {
  const selected = athletes.find((athlete) => athlete.id === value)

  return (
    <Box className={classes.corner} data-corner={corner}>
      <Text className={classes.cornerLabel}>{corner} corner</Text>

      <Select
        placeholder="Select fighter"
        data={athletes.map((athlete) => ({
          value: athlete.id,
          label: athleteName(athlete),
          /* Left visible rather than filtered out, so it is clear the
             fighter exists and is simply already booked. */
          disabled: unavailable.has(athlete.id),
        }))}
        value={value || null}
        onChange={(next) => onChange(next ?? '')}
        searchable
        clearable
        nothingFoundMessage="No fighter found"
        aria-label={`${corner} corner fighter`}
      />

      {/* The nickname is the fastest way to confirm the right person was
          picked out of a list where surnames repeat. */}
      <Text fz={12} c="var(--vfl-gray-muted)" className={classes.cornerMeta}>
        {selected?.nickname ? `“${selected.nickname}”` : ' '}
      </Text>
    </Box>
  )
}

/** The panel beside the card: builds one bout, or edits one already on it. */
export function BoutForm({
  draft,
  editing,
  athletes,
  divisions,
  bookedElsewhere,
  onChange,
  onSubmit,
  onCancel,
}: BoutFormProps) {
  const unavailableForRed = new Set(bookedElsewhere)
  if (draft.blue_corner_id) unavailableForRed.add(draft.blue_corner_id)

  const unavailableForBlue = new Set(bookedElsewhere)
  if (draft.red_corner_id) unavailableForBlue.add(draft.red_corner_id)

  const complete = Boolean(draft.red_corner_id && draft.blue_corner_id)

  const setTitleFight = (checked: boolean) => {
    /* Championship bouts are five rounds. Ticking the box moves the
       scheduled rounds with it, but only upwards — a shorter number chosen
       deliberately afterwards is left alone. */
    const rounds = (draft.scheduled_rounds ?? 0) < TITLE_FIGHT_ROUNDS ? TITLE_FIGHT_ROUNDS : undefined
    onChange({
      is_title_fight: checked,
      ...(checked && rounds ? { scheduled_rounds: rounds } : {}),
    })
  }

  return (
    <Box className={classes.panel}>
      <Text className="vfl-label" mb={18}>
        {editing ? 'Edit Bout' : 'Add Bout'}
      </Text>

      <Stack gap={20}>
        <Box className={classes.matchup}>
          <CornerPicker
            corner="red"
            value={draft.red_corner_id}
            athletes={athletes}
            unavailable={unavailableForRed}
            onChange={(id) => onChange({ red_corner_id: id })}
          />

          <Text className={`vfl-display ${classes.versus}`}>vs</Text>

          <CornerPicker
            corner="blue"
            value={draft.blue_corner_id}
            athletes={athletes}
            unavailable={unavailableForBlue}
            onChange={(id) => onChange({ blue_corner_id: id })}
          />
        </Box>

        <SimpleGrid cols={2} spacing={14}>
          <Select
            label="Segment"
            data={BOUT_SEGMENTS.map((segment) => ({
              value: segment,
              label: segmentLabel(segment),
            }))}
            value={draft.segment}
            onChange={(next) => onChange({ segment: (next ?? 'main_card') as BoutSegment })}
            allowDeselect={false}
          />

          <Select
            label="Rounds"
            data={SCHEDULED_ROUNDS.map((rounds) => ({
              value: String(rounds),
              label: String(rounds),
            }))}
            value={String(draft.scheduled_rounds ?? '')}
            onChange={(next) => onChange({ scheduled_rounds: Number(next) })}
            allowDeselect={false}
          />

          <Select
            label="Division"
            placeholder="Optional"
            data={divisions.map((division) => ({ value: division.id, label: division.name }))}
            value={draft.division_id || null}
            onChange={(next) => onChange({ division_id: next ?? '' })}
            searchable
            clearable
          />

          <TextInput
            label="Weight Class"
            placeholder="Catchweight 178"
            maxLength={80}
            value={draft.weight_class_label ?? ''}
            onChange={(event) => onChange({ weight_class_label: event.currentTarget.value })}
          />
        </SimpleGrid>

        <Group gap={24}>
          <Checkbox
            label="Title fight"
            checked={Boolean(draft.is_title_fight)}
            onChange={(event) => setTitleFight(event.currentTarget.checked)}
          />
          <Checkbox
            label="Main event"
            checked={Boolean(draft.is_main_event)}
            onChange={(event) => onChange({ is_main_event: event.currentTarget.checked })}
          />
        </Group>

        <Group gap={12} className={classes.panelActions}>
          <Button onClick={onSubmit} disabled={!complete} className={classes.grow}>
            {editing ? 'Save Bout' : 'Add to Card'}
          </Button>
          {/* Only offered while editing: with a blank panel there is nothing
              to back out of. */}
          {editing && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Group>
      </Stack>
    </Box>
  )
}
