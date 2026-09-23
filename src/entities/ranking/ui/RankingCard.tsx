import { ActionIcon, Box, Button, Paper, Text, Tooltip } from '@mantine/core'
import { IconPencil, IconPointFilled, IconSend, IconTrash, IconTrophy } from '@tabler/icons-react'
import { athleteName, type Athlete } from '@/entities/athlete/@x/ranking'
import { divisionKindLabel } from '@/entities/division/@x/ranking'
import { championLabelText, type RankingSnapshot } from '../model/types'
import classes from './RankingCard.module.css'

interface RankingCardProps {
  snapshot: RankingSnapshot
  onEdit: () => void
  onRemove: () => void
  onPublish: () => void
  removing?: boolean
  publishing?: boolean
}

function initials(athlete: Athlete) {
  return (
    [athlete.first_name, athlete.last_name]
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

function formatDate(iso: string | undefined) {
  if (!iso) return null
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Gender · kind · weight limit, as a single dotted line under the title. */
function divisionMeta(snapshot: RankingSnapshot): string {
  const division = snapshot.division
  if (!division) return 'Division removed'
  return [
    division.gender,
    divisionKindLabel(division.kind),
    division.weight_limit_lbs ? `${division.weight_limit_lbs} lb` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function RankingCard({
  snapshot,
  onEdit,
  onRemove,
  onPublish,
  removing,
  publishing,
}: RankingCardProps) {
  const published = snapshot.status === 'published'
  const champion = snapshot.champion
  /* `vacant` is a real editorial state — a belt with no holder — so it is
     drawn as an empty plate rather than as missing data. */
  const vacant = !champion || snapshot.champion_label === 'vacant'
  const photo = champion?.photo_thumbnail_url || champion?.photo_url
  const publishedOn = formatDate(snapshot.published_at)

  return (
    <Paper
      className={classes.card}
      data-published={published || undefined}
      data-removing={removing || undefined}
      p={0}
      /* Same reason as AthleteCard: --vfl-card is page-white in light mode,
         so the card would have no fill of its own. */
      bg="var(--vfl-bg-soft)"
    >
      <Box className={classes.head}>
        <Box className={classes.headText}>
          <Text className={`vfl-display ${classes.division}`}>
            {snapshot.division?.name ?? 'Unknown Division'}
          </Text>
          <Text className={`vfl-label ${classes.divisionMeta}`}>{divisionMeta(snapshot)}</Text>
        </Box>

        <Box className={`vfl-label ${classes.status}`}>
          <IconPointFilled size={9} />
          {published ? 'Published' : 'Draft'}
        </Box>
      </Box>

      <Box className={classes.champion}>
        <Box className={classes.plate} data-vacant={vacant || undefined}>
          {photo ? (
            <img src={photo} alt={athleteName(champion)} className={classes.photo} loading="lazy" />
          ) : champion ? (
            <Text className={`vfl-display ${classes.initials}`} aria-hidden>
              {initials(champion)}
            </Text>
          ) : (
            <IconTrophy size={22} className={classes.plateIcon} aria-hidden />
          )}
        </Box>

        <Box miw={0}>
          <Text className={`vfl-label ${classes.championLabel}`} data-vacant={vacant || undefined}>
            {championLabelText(snapshot.champion_label)}
          </Text>
          <Text className={`vfl-display ${classes.championName}`}>
            {champion ? athleteName(champion) : 'No Champion'}
          </Text>
        </Box>
      </Box>

      <Box className={classes.details}>
        <Box className={classes.detail}>
          <Text className="vfl-label">Notes</Text>
          <Text className={classes.detailValue} lineClamp={2}>
            {snapshot.notes || '—'}
          </Text>
        </Box>
        <Box className={classes.detail}>
          <Text className="vfl-label">Published</Text>
          <Text className={`vfl-numeric ${classes.detailValue}`}>{publishedOn ?? '—'}</Text>
        </Box>
      </Box>

      <Box className={classes.footer}>
        {published ? (
          /* Nothing to do on a live snapshot, so the slot carries the state
             instead of a disabled button. */
          <Text className={`vfl-label ${classes.live}`}>Live on site</Text>
        ) : (
          <Button
            size="compact-sm"
            leftSection={<IconSend size={14} />}
            loading={publishing}
            onClick={onPublish}
          >
            Publish
          </Button>
        )}

        <Box className={classes.actions}>
          <Tooltip label="Edit" withArrow={false}>
            <ActionIcon variant="subtle" size={32} radius={0} aria-label="Edit" onClick={onEdit}>
              <IconPencil size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove" withArrow={false}>
            <ActionIcon
              variant="subtle"
              size={32}
              radius={0}
              className={classes.remove}
              aria-label="Remove"
              onClick={onRemove}
              disabled={removing}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  )
}
