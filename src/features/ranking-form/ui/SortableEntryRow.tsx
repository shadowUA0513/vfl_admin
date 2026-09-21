import { ActionIcon, Box, Group, Text } from '@mantine/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconArrowDown, IconArrowUp, IconGripVertical, IconX } from '@tabler/icons-react'
import { athleteName, type Athlete } from '@/entities/athlete'
import classes from './RankingEntriesEditor.module.css'

interface SortableEntryRowProps {
  athleteId: string
  athlete: Athlete | undefined
  position: number
  isFirst: boolean
  isLast: boolean
  moved: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  registerRef: (id: string, element: HTMLDivElement | null) => void
}

export function SortableEntryRow({
  athleteId,
  athlete,
  position,
  isFirst,
  isLast,
  moved,
  onMoveUp,
  onMoveDown,
  onRemove,
  registerRef,
}: SortableEntryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: athleteId,
  })

  return (
    <Box
      ref={(element: HTMLDivElement | null) => {
        /* dnd-kit needs the node to measure and translate it; the editor
           needs it to capture positions for the arrow-button animation. */
        setNodeRef(element)
        registerRef(athleteId, element)
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        /* Lifted above its neighbours so it is not clipped by the next row's
           border while it travels. */
        zIndex: isDragging ? 2 : undefined,
      }}
      className={classes.row}
      data-moved={moved || undefined}
      data-dragging={isDragging || undefined}
    >
      <ActionIcon
        variant="subtle"
        size={28}
        radius={0}
        className={classes.handle}
        aria-label={`Reorder ${athlete ? athleteName(athlete) : 'athlete'}`}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={16} />
      </ActionIcon>

      {/* Keyed on the number so the digit itself re-renders with a quick
          fade whenever a row's rank changes. */}
      <Text key={position} className={`vfl-display vfl-numeric ${classes.rank}`}>
        {position}
      </Text>

      <Box className={classes.name}>
        <Text fz={14} c="var(--vfl-white)">
          {athlete ? athleteName(athlete) : 'Unknown athlete'}
        </Text>
        {athlete?.nickname && (
          <Text fz={12} c="var(--vfl-gray-muted)">
            &ldquo;{athlete.nickname}&rdquo;
          </Text>
        )}
      </Box>

      <Group gap={2} wrap="nowrap">
        <ActionIcon
          variant="subtle"
          size={30}
          radius={0}
          aria-label="Move up"
          disabled={isFirst}
          onClick={onMoveUp}
        >
          <IconArrowUp size={15} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size={30}
          radius={0}
          aria-label="Move down"
          disabled={isLast}
          onClick={onMoveDown}
        >
          <IconArrowDown size={15} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          size={30}
          radius={0}
          aria-label="Remove"
          className={classes.remove}
          onClick={onRemove}
        >
          <IconX size={15} />
        </ActionIcon>
      </Group>
    </Box>
  )
}
