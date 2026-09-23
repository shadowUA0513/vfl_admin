import { Box, Button, Group, Modal, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import type { Athlete } from '@/entities/athlete'
import {
  emptyBoutDraft,
  segmentLabel,
  type BoutDraft,
  type BoutMethod,
  type BoutSegment,
} from '@/entities/bout'
import type { Division } from '@/entities/division'
import { BoutForm } from './BoutForm'
import { BoutRow } from './BoutRow'
import classes from './FightCardModal.module.css'

interface FightCardModalProps {
  opened: boolean
  onClose: () => void
  value: BoutDraft[]
  onChange: (bouts: BoutDraft[]) => void
  /** Per-bout messages keyed by draft key, produced by the event form. */
  errors: Record<string, string>
  athletes: Athlete[]
  athletesById: Map<string, Athlete>
  divisions: Division[]
}

/**
 * The whole fight card in one place: the running order down the left, the
 * bout being built or edited down the right.
 *
 * Changes go straight back to the event form through `onChange` rather than
 * being staged here — closing this is not a cancel, and the event's own Save
 * is still what writes any of it to the API.
 */
export function FightCardModal({
  opened,
  onClose,
  value,
  onChange,
  errors,
  athletes,
  athletesById,
  divisions,
}: FightCardModalProps) {
  /* The panel's working copy. Always a whole draft rather than a partial,
     so editing an existing bout is just loading it in here. It deliberately
     survives a close: reopening the card puts you back where you were. */
  const [working, setWorking] = useState<BoutDraft>(emptyBoutDraft)

  /* Below this the two panes stop fitting side by side, and a dialog that
     has to be scrolled in both directions is worse than a full screen. */
  const narrow = useMediaQuery('(max-width: 980px)')

  /* Both halves of setting a result are local, like every other change on
     this card. A bout added a moment ago has no id for a result to hang off
     yet, so the event's Save is what writes both: the bout first, then its
     result. */
  const setResult = (draft: BoutDraft, result: Partial<BoutDraft>) => {
    onChange(value.map((bout) => (bout.key === draft.key ? { ...bout, ...result } : bout)))
  }

  const pickWinner = (draft: BoutDraft, athleteId: string, method: BoutMethod) =>
    setResult(draft, { outcome: 'win', winner_id: athleteId, method })

  const clearResult = (draft: BoutDraft) =>
    setResult(draft, { outcome: undefined, winner_id: undefined, method: undefined })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      /* A few pixels of travel before a drag starts, so a plain click on the
         handle is not swallowed and a twitchy mouse does not reorder. */
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const editing = value.some((bout) => bout.key === working.key)

  const commit = () => {
    const index = value.findIndex((bout) => bout.key === working.key)
    const next =
      index === -1 ? [...value, working] : value.map((bout, i) => (i === index ? working : bout))

    /* A card has one main event, so ticking a second one unticks the first
       rather than leaving the card in a state the API will happily store
       and every downstream graphic will disagree about. */
    onChange(
      working.is_main_event
        ? next.map((bout) => (bout.key === working.key ? bout : { ...bout, is_main_event: false }))
        : next,
    )

    setWorking(emptyBoutDraft())
  }

  const removeAt = (index: number) => {
    const removed = value[index]
    onChange(value.filter((_, i) => i !== index))
    /* Removing the bout the panel was editing leaves it editing something
       that no longer exists, so the panel goes back to blank. */
    if (removed.key === working.key) setWorking(emptyBoutDraft())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const keys = value.map((draft) => draft.key)
    const from = keys.indexOf(String(active.id))
    const to = keys.indexOf(String(over.id))
    if (from === -1 || to === -1) return

    onChange(arrayMove(value, from, to))
  }

  /* Everyone booked in the card's *other* bouts, so the panel can grey them
     out. The bout being edited is excluded, or it would rule out its own
     two fighters. */
  const bookedElsewhere = new Set<string>()
  for (const bout of value) {
    if (bout.key === working.key) continue
    if (bout.red_corner_id) bookedElsewhere.add(bout.red_corner_id)
    if (bout.blue_corner_id) bookedElsewhere.add(bout.blue_corner_id)
  }

  const summary = value.reduce((counts, draft) => {
    counts.set(draft.segment, (counts.get(draft.segment) ?? 0) + 1)
    return counts
  }, new Map<BoutSegment, number>())

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Fight Card"
      size={1080}
      fullScreen={narrow}
      classNames={{ body: classes.modalBody }}
    >
      <Box className={classes.builder}>
        <Box className={classes.cardPane}>
          <Group justify="space-between" align="flex-end" mb={12}>
            <Text className="vfl-label">Running Order</Text>
            <Text fz={12} c="var(--vfl-gray-muted)">
              {value.length === 0
                ? 'No bouts'
                : [...summary]
                    .map(([segment, count]) => `${count} ${segmentLabel(segment)}`)
                    .join(' · ')}
            </Text>
          </Group>

          <Box className={classes.list}>
            {value.length === 0 && (
              <Box className={classes.empty}>
                <Text fz={13} c="var(--vfl-gray-muted)">
                  Nothing on the card yet. Pick two fighters on the right and add them.
                </Text>
              </Box>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              /* Rows only ever move up and down inside the list, so the
                 pointer cannot drag one sideways or out of the panel. */
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={value.map((draft) => draft.key)}
                strategy={verticalListSortingStrategy}
              >
                {value.map((draft, index) => (
                  <BoutRow
                    key={draft.key}
                    draft={draft}
                    position={index + 1}
                    byId={athletesById}
                    error={errors[draft.key]}
                    active={draft.key === working.key}
                    onPickWinner={(athleteId, method) => pickWinner(draft, athleteId, method)}
                    onClearResult={() => clearResult(draft)}
                    onEdit={() => setWorking(draft)}
                    onRemove={() => removeAt(index)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>

          <Text fz={12} c="var(--vfl-gray-muted)" mt={10}>
            Drag a bout to reorder it. Click the fighter who won and pick how the bout
            ended &mdash; results save with the event.
          </Text>
        </Box>

        <BoutForm
          draft={working}
          editing={editing}
          athletes={athletes}
          divisions={divisions}
          bookedElsewhere={bookedElsewhere}
          onChange={(patch) => setWorking((current) => ({ ...current, ...patch }))}
          onSubmit={commit}
          onCancel={() => setWorking(emptyBoutDraft())}
        />
      </Box>

      <Group justify="flex-end" mt={24} pt={20} className={classes.modalActions}>
        <Button onClick={onClose}>Done</Button>
      </Group>
    </Modal>
  )
}
