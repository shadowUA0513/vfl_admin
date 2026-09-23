import { ActionIcon, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconGripVertical, IconPencil, IconX } from '@tabler/icons-react'
import { athleteName, type Athlete } from '@/entities/athlete'
import {
  BOUT_METHODS,
  boutWinner,
  methodLabel,
  segmentLabel,
  type BoutDraft,
  type BoutMethod,
} from '@/entities/bout'
import classes from './FightCardModal.module.css'

interface BoutRowProps {
  draft: BoutDraft
  position: number
  /** Athletes by id, for turning the two corner ids into names. */
  byId: Map<string, Athlete>
  error?: string
  /** The bout currently loaded in the panel beside the card. */
  active?: boolean
  onPickWinner: (athleteId: string, method: BoutMethod) => void
  onClearResult: () => void
  onEdit: () => void
  onRemove: () => void
}

/* One line on the card. The bout itself is edited in the panel; the only
   thing changed from here is the result — click the fighter who won.

   That opens a menu rather than settling it in one click, because the API
   rejects a win with no method attached. */
export function BoutRow({
  draft,
  position,
  byId,
  error,
  active,
  onPickWinner,
  onClearResult,
  onEdit,
  onRemove,
}: BoutRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: draft.key,
  })

  const winnerId = boutWinner(draft)

  const name = (id: string) => {
    const athlete = byId.get(id)
    return athlete ? athleteName(athlete) : 'Unknown fighter'
  }

  const tags = [
    segmentLabel(draft.segment),
    `${draft.scheduled_rounds ?? '?'} rds`,
    draft.is_title_fight ? 'Title' : null,
    draft.is_main_event ? 'Main Event' : null,
    /* Once there is a result, how it ended matters more on this line than
       how many rounds it was booked for. */
    winnerId ? methodLabel(draft.method) : null,
  ].filter(Boolean)

  const fighter = (corner: 'red' | 'blue', id: string) => {
    const won = winnerId === id
    const lost = Boolean(winnerId) && !won

    return (
      <Menu position="bottom-start" withArrow shadow="none" width={200}>
        <Menu.Target>
          <UnstyledButton
            className={classes.fighter}
            data-corner={corner}
            data-won={won || undefined}
            data-lost={lost || undefined}
            aria-label={`Result for ${name(id)}`}
          >
            <span className={classes.fighterName}>{name(id)}</span>
            {won && <span className={classes.winBadge}>W</span>}
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{name(id)} wins by</Menu.Label>
          {BOUT_METHODS.map((method) => (
            <Menu.Item
              key={method}
              onClick={() => onPickWinner(id, method)}
              data-chosen={won && draft.method === method ? true : undefined}
              className={classes.methodItem}
            >
              {methodLabel(method)}
            </Menu.Item>
          ))}

          {/* Only offered on the fighter who actually won — clearing from
              the loser's name would read as undoing something else. */}
          {won && (
            <>
              <Menu.Divider />
              <Menu.Item onClick={onClearResult} className={classes.clearItem}>
                Clear result
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    )
  }

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
      className={classes.bout}
      data-dragging={isDragging || undefined}
      data-invalid={error ? true : undefined}
      data-active={active || undefined}
    >
      <Box className={classes.row}>
        <ActionIcon
          variant="subtle"
          size={28}
          radius={0}
          className={classes.handle}
          aria-label={`Reorder bout ${position}`}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={16} />
        </ActionIcon>

        <Text className={`vfl-display vfl-numeric ${classes.boutNumber}`}>{position}</Text>

        <Box className={classes.content}>
          <Box className={classes.names}>
            {fighter('red', draft.red_corner_id)}
            <Text className={classes.versus}>vs</Text>
            {fighter('blue', draft.blue_corner_id)}
          </Box>

          <Text className={classes.tags}>{tags.join(' · ')}</Text>
        </Box>

        <Group gap={2} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            size={28}
            radius={0}
            aria-label={`Edit bout ${position}`}
            onClick={onEdit}
          >
            <IconPencil size={15} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            size={28}
            radius={0}
            aria-label={`Remove bout ${position}`}
            className={classes.remove}
            onClick={onRemove}
          >
            <IconX size={15} />
          </ActionIcon>
        </Group>
      </Box>

      {error && (
        <Text fz={12} c="var(--vfl-red-bright)" className={classes.error}>
          {error}
        </Text>
      )}
    </Box>
  )
}
