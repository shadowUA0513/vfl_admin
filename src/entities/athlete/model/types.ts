/* Mirrors model.Athlete / dto.CreateAthleteRequest.

   The API is asymmetric about career stats: it returns the 12 numbers
   flattened onto the athlete, but only accepts them nested under
   `career_stats`. The win/loss record next to them is read-only in both
   directions — it appears on model.Athlete but on neither write DTO,
   because the server derives it from bout results and legacy fights. */

export type AthleteStatus = 'active' | 'inactive' | 'retired'

/* The API types `stance` as a free string (max 24), but only these three
   are meaningful, and a select keeps the data clean. */
export const ATHLETE_STANCES = ['Orthodox', 'Southpaw', 'Switch'] as const
export type AthleteStance = (typeof ATHLETE_STANCES)[number]

/* dto.CareerStatsRequest — the only performance numbers the API will take
   from the admin. Percentages are whole numbers (54.3 meaning 54.3%), not
   fractions; the API declares no bounds, so the form is what enforces them. */
export interface CareerStats {
  sig_strikes_landed?: number
  sig_strikes_attempted?: number
  striking_accuracy?: number
  striking_defense?: number
  strikes_landed_per_min?: number
  strikes_absorbed_per_min?: number
  takedowns_landed?: number
  takedowns_attempted?: number
  takedown_accuracy?: number
  takedown_defense?: number
  takedown_avg_per_15_min?: number
  submission_avg_per_15_min?: number
}

/* The record, as the API reports it. Read-only: no write DTO binds these,
   so the way to move them is a bout result or a legacy fight entry. */
export interface AthleteRecord {
  wins?: number
  losses?: number
  draws?: number
  no_contests?: number
  wins_by_ko?: number
  wins_by_submission?: number
  wins_by_decision?: number
  losses_by_ko?: number
  losses_by_submission?: number
  losses_by_decision?: number
}

/* Career stats arrive flattened onto the athlete, which is why this extends
   them rather than nesting a `career_stats` object as the write DTO does. */
export interface Athlete extends CareerStats, AthleteRecord {
  id: string
  first_name: string
  last_name: string
  nickname?: string
  division_id?: string
  country?: string
  hometown?: string
  date_of_birth?: string
  status?: AthleteStatus
  /* Physicals. The API stores these as floats. */
  height_cm?: number
  weight_kg?: number
  reach_cm?: number
  leg_reach_cm?: number
  stance?: string
  photo_url?: string
  photo_thumbnail_url?: string
  photo_large_url?: string
  slug?: string
}

export interface AthleteInput {
  first_name: string
  last_name: string
  nickname?: string
  division_id?: string
  country?: string
  hometown?: string
  date_of_birth?: string
  status?: AthleteStatus
  height_cm?: number
  weight_kg?: number
  reach_cm?: number
  leg_reach_cm?: number
  stance?: string
  photo_url?: string
  photo_thumbnail_url?: string
  photo_large_url?: string
  /* Nested on write, flat on read — see the note at the top of the file. */
  career_stats?: CareerStats
}

/* Mantine's NumberInput yields '' for an empty box. The API rejects that
   where it wants a number, so blanks become undefined and are dropped. */
export function optionalNumber(value: number | string | undefined): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const ATHLETE_STATUSES: AthleteStatus[] = ['active', 'inactive', 'retired']

export function athleteName(athlete: Athlete): string {
  return [athlete.first_name, athlete.last_name].filter(Boolean).join(' ')
}

export function formatRecord(athlete: Athlete): string {
  return `${athlete.wins ?? 0}-${athlete.losses ?? 0}-${athlete.draws ?? 0}`
}

/** The 12 writable stats, lifted off the flat read shape into the write one. */
export function toCareerStats(athlete: Athlete): CareerStats {
  return {
    sig_strikes_landed: athlete.sig_strikes_landed,
    sig_strikes_attempted: athlete.sig_strikes_attempted,
    striking_accuracy: athlete.striking_accuracy,
    striking_defense: athlete.striking_defense,
    strikes_landed_per_min: athlete.strikes_landed_per_min,
    strikes_absorbed_per_min: athlete.strikes_absorbed_per_min,
    takedowns_landed: athlete.takedowns_landed,
    takedowns_attempted: athlete.takedowns_attempted,
    takedown_accuracy: athlete.takedown_accuracy,
    takedown_defense: athlete.takedown_defense,
    takedown_avg_per_15_min: athlete.takedown_avg_per_15_min,
    submission_avg_per_15_min: athlete.submission_avg_per_15_min,
  }
}

/* Every key run through optionalNumber, so a box the editor cleared is
   dropped instead of being sent as '' — which the API rejects outright. */
export function normalizeCareerStats(stats: CareerStats | undefined): CareerStats | undefined {
  if (!stats) return undefined
  const cleaned: CareerStats = {}
  for (const [key, value] of Object.entries(stats)) {
    const parsed = optionalNumber(value as number | string | undefined)
    if (parsed !== undefined) cleaned[key as keyof CareerStats] = parsed
  }
  /* An object with nothing in it would blank the stored stats on the server
     side of a partial update, so an untouched section sends nothing at all. */
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

/* The API takes and returns RFC3339 for date_of_birth, but a `date` input
   speaks `YYYY-MM-DD`. Sending the bare date is rejected outright
   ("cannot parse \"\" as \"T\""), so the form converts in both directions.
   Midnight UTC is used rather than local midnight: a birth date has no
   time-of-day, and anchoring to UTC stops the date shifting by one for
   viewers behind or ahead of the line. */

export function isoToDateInput(iso: string | undefined): string {
  if (!iso) return ''
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

export function dateInputToIso(date: string): string | undefined {
  if (!date) return undefined
  const parsed = new Date(`${date}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

/* Narrows a fetched athlete to just the fields this admin owns.

   The API returns 43 fields on read — timestamps, audit columns and the
   derived win/loss record among them. Echoing all of those back on update
   works today only because the server ignores what its DTO does not bind;
   it is not something to rely on. */
export function toAthleteInput(athlete: Athlete): AthleteInput {
  return {
    first_name: athlete.first_name,
    last_name: athlete.last_name,
    nickname: athlete.nickname,
    division_id: athlete.division_id,
    country: athlete.country,
    hometown: athlete.hometown,
    date_of_birth: athlete.date_of_birth,
    status: athlete.status,
    height_cm: athlete.height_cm,
    weight_kg: athlete.weight_kg,
    reach_cm: athlete.reach_cm,
    leg_reach_cm: athlete.leg_reach_cm,
    stance: athlete.stance,
    career_stats: toCareerStats(athlete),
    photo_url: athlete.photo_url,
    photo_thumbnail_url: athlete.photo_thumbnail_url,
    photo_large_url: athlete.photo_large_url,
  }
}
