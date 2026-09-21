import { Box, Button, Group, Select, Text } from '@mantine/core'
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
import { IconPlus } from '@tabler/icons-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { athleteName, type Athlete } from '@/entities/athlete'
import type { RankingEntryInput } from '@/entities/ranking'
import { SortableEntryRow } from './SortableEntryRow'
import classes from './RankingEntriesEditor.module.css'

interface RankingEntriesEditorProps {
  value: RankingEntryInput[]
  onChange: (entries: RankingEntryInput[]) => void
  athletes: Athlete[]
  /** Excluded from the picker — the champion sits outside the ladder. */
  championId?: string
  error?: string
}

/* Rank is derived from position rather than typed. Letting both exist
   invites duplicate or gapped ranks, and the order on screen is the thing
   being edited anyway. */
function renumber(entries: RankingEntryInput[]): RankingEntryInput[] {
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }))
}

const MOVE_MS = 320
const EASE = 'cubic-bezier(.16, 1, .3, 1)'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function RankingEntriesEditor({
  value,
  onChange,
  athletes,
  championId,
  error,
}: RankingEntriesEditorProps) {
  const [picked, setPicked] = useState<string | null>(null)
  /* Drives the accent flash, so it is obvious which row just moved when two
     rows swap and both are in motion. */
  const [movedId, setMovedId] = useState<string | null>(null)

  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  /* Row positions captured immediately before a reorder — the "First" half
     of a FLIP animation. */
  const previousTops = useRef<Map<string, number> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      /* A few pixels of travel before a drag starts, so a plain click on the
         handle is not swallowed and a twitchy mouse does not reorder. */
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /* FLIP: after React has repainted the new order, each row is offset back
     to where it used to be and animated to zero. The rows therefore appear
     to travel, even though the DOM jumped straight to its final state.

     Only used for the arrow buttons and adds — dnd-kit animates its own
     reorders, and running both would fight over `transform`. */
  useLayoutEffect(() => {
    const before = previousTops.current
    previousTops.current = null
    if (!before || prefersReducedMotion()) return

    rowRefs.current.forEach((element, id) => {
      const previousTop = before.get(id)
      if (previousTop === undefined) {
        /* A row that did not exist a moment ago: fade it in rather than
           sliding it from an imaginary old position. */
        element.animate(
          [
            { opacity: 0, transform: 'translateY(-8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: MOVE_MS, easing: EASE },
        )
        return
      }

      const delta = previousTop - element.getBoundingClientRect().top
      if (Math.abs(delta) < 1) return

      element.animate(
        [{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }],
        { duration: MOVE_MS, easing: EASE },
      )
    })
  }, [value])

  const capturePositions = () => {
    const tops = new Map<string, number>()
    rowRefs.current.forEach((element, id) => {
      tops.set(id, element.getBoundingClientRect().top)
    })
    previousTops.current = tops
  }

  const flash = (athleteId: string) => {
    setMovedId(athleteId)
    window.setTimeout(() => {
      setMovedId((current) => (current === athleteId ? null : current))
    }, 700)
  }

  const registerRef = (id: string, element: HTMLDivElement | null) => {
    if (element) rowRefs.current.set(id, element)
    else rowRefs.current.delete(id)
  }

  const byId = new Map(athletes.map((athlete) => [athlete.id, athlete]))
  const taken = new Set(value.map((entry) => entry.athlete_id))
  const ids = value.map((entry) => entry.athlete_id)

  const selectable = athletes.filter(
    (athlete) => !taken.has(athlete.id) && athlete.id !== championId,
  )

  const add = () => {
    if (!picked) return
    capturePositions()
    onChange(renumber([...value, { athlete_id: picked, rank: value.length + 1 }]))
    flash(picked)
    setPicked(null)
  }

  const removeAt = (index: number) => {
    const removed = value[index].athlete_id
    capturePositions()
    rowRefs.current.delete(removed)
    onChange(renumber(value.filter((_, i) => i !== index)))
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= value.length) return

    capturePositions()
    onChange(renumber(arrayMove(value, index, target)))
    flash(value[index].athlete_id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return

    /* No capturePositions() here on purpose: dnd-kit already animates the
       drop, and a FLIP on top of it would double-animate the same move. */
    onChange(renumber(arrayMove(value, from, to)))
  }

  return (
    <Box>
      <Group justify="space-between" align="flex-end" mb={12}>
        <Text className="vfl-label">Ranked Contenders</Text>
        <Text fz={12} c="var(--vfl-gray-muted)">
          {value.length} ranked
        </Text>
      </Group>

      <Box className={classes.list}>
        {value.length === 0 && (
          <Box className={classes.empty}>
            <Text fz={13} c="var(--vfl-gray-muted)">
              Add athletes below, then drag to set the order.
            </Text>
          </Box>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          /* Rows only ever move up and down inside the list, so the pointer
             cannot drag one sideways or out of the panel. */
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {value.map((entry, index) => (
              <SortableEntryRow
                key={entry.athlete_id}
                athleteId={entry.athlete_id}
                athlete={byId.get(entry.athlete_id)}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === value.length - 1}
                moved={movedId === entry.athlete_id}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                onRemove={() => removeAt(index)}
                registerRef={registerRef}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Box>

      {error && (
        <Text fz={12} c="var(--vfl-red-bright)" mt={8}>
          {error}
        </Text>
      )}

      <Group gap={12} mt={16} align="flex-end" wrap="nowrap">
        <Select
          placeholder={selectable.length ? 'Add an athlete' : 'No athletes left to add'}
          data={selectable.map((athlete) => ({
            value: athlete.id,
            label: athleteName(athlete),
          }))}
          value={picked}
          onChange={setPicked}
          disabled={selectable.length === 0}
          searchable
          className={classes.picker}
        />
        <Button
          variant="outline"
          leftSection={<IconPlus size={15} />}
          onClick={add}
          disabled={!picked}
        >
          Add
        </Button>
      </Group>
    </Box>
  )
}
