import { ActionIcon, Box, Paper, Text, Tooltip } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { athleteName, formatRecord, type Athlete } from '../model/types'
import classes from './AthleteCard.module.css'

interface AthleteCardProps {
  athlete: Athlete
  /** Resolved by the page — an athlete only carries division_id. */
  divisionName?: string
  weightLimitLbs?: number
  onEdit: () => void
  onRemove: () => void
  removing?: boolean
}

const LB_TO_KG = 0.45359237

function statusColor(status: Athlete['status']) {
  if (status === 'active') return 'var(--vfl-white-soft)'
  if (status === 'retired') return 'var(--vfl-red-bright)'
  return 'var(--vfl-gray-muted)'
}

function initials(athlete: Athlete) {
  return (
    [athlete.first_name, athlete.last_name]
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

export function AthleteCard({
  athlete,
  divisionName,
  weightLimitLbs,
  onEdit,
  onRemove,
  removing,
}: AthleteCardProps) {
  /* Prefer the main photo, fall back to the thumbnail — an athlete may have
     had only one of the three set via the upload slots on AthleteForm. */
  const photo = athlete.photo_url || athlete.photo_thumbnail_url

  return (
    <Paper
      className={classes.card}
      data-removing={removing || undefined}
      p={0}
      /* Overrides the theme's default `bg: var(--vfl-card)` — in light mode
         that token is the same white as the page, so the card would have
         no fill to distinguish it from the canvas behind it, leaving only
         a faint 1px border to mark the edge. */
      bg="var(--vfl-bg-soft)"
    >
      <Box className={classes.media}>
        {photo ? (
          <img src={photo} alt={athleteName(athlete)} className={classes.photo} loading="lazy" />
        ) : (
          /* Oversized initials rather than an outlined empty box: with no
             photo the card still has a deliberate focal point. */
          <Text className={`vfl-display ${classes.initials}`} aria-hidden>
            {initials(athlete)}
          </Text>
        )}

        <Box className={classes.actions}>
          <Tooltip label="Edit" withArrow={false}>
            <ActionIcon
              variant="filled"
              size={30}
              radius={0}
              className={classes.action}
              aria-label="Edit"
              onClick={onEdit}
            >
              <IconPencil size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove" withArrow={false}>
            <ActionIcon
              variant="filled"
              size={30}
              radius={0}
              className={`${classes.action} ${classes.remove}`}
              aria-label="Remove"
              onClick={onRemove}
              disabled={removing}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        </Box>

        {/* Name sits on the image, over a gradient so it stays readable
            whatever the photo is. */}
        <Box className={classes.nameplate}>
          {athlete.nickname && (
            <Text className={`vfl-label ${classes.nickname}`}>
              &ldquo;{athlete.nickname}&rdquo;
            </Text>
          )}
          <Text className={`vfl-display ${classes.name}`}>{athleteName(athlete)}</Text>
        </Box>
      </Box>

      <Box className={classes.meta}>
        <Box className={classes.metaRow}>
          <Text className={`vfl-label ${classes.truncate}`} c="var(--vfl-gray)">
            {divisionName ?? 'No division'}
          </Text>
          <Text className={`vfl-numeric ${classes.weight}`}>
            {weightLimitLbs ? `${weightLimitLbs} lb · ${(weightLimitLbs * LB_TO_KG).toFixed(1)} kg` : '—'}
          </Text>
        </Box>

        <Box className={classes.metaRow}>
          <Text className={`vfl-numeric ${classes.record}`}>
            {formatRecord(athlete)}
            <span className={classes.recordKey}>W-L-D</span>
          </Text>
          <Text className={`vfl-label ${classes.truncate}`} c={statusColor(athlete.status)}>
            {athlete.status ?? 'unknown'}
            {athlete.country ? ` · ${athlete.country}` : ''}
          </Text>
        </Box>
      </Box>
    </Paper>
  )
}
