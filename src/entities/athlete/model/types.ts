/* Mirrors model.Athlete / dto.CreateAthleteRequest.

   Identity and physicals are editable. Two groups are deliberately absent:
   `career_stats` (12 numbers the API derives from bout results) and the
   photo URL fields, which want an upload flow via POST /admin/uploads
   rather than three free-text boxes. Both pass through untouched on read. */

export type AthleteStatus = 'active' | 'inactive' | 'retired'

/* The API types `stance` as a free string (max 24), but only these three
   are meaningful, and a select keeps the data clean. */
export const ATHLETE_STANCES = ['Orthodox', 'Southpaw', 'Switch'] as const
export type AthleteStance = (typeof ATHLETE_STANCES)[number]

export interface Athlete {
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
  /* Read-only. The API derives the record from bout results; it cannot be
     set through the create/update payload. */
  wins?: number
  losses?: number
  draws?: number
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

   The API returns 43 fields on read — timestamps, audit columns, the derived
   win/loss record and 12 flattened career stats. Echoing all of those back
   on update works today only because the server ignores what its DTO does
   not bind; it is not something to rely on. Omitted fields are left as they
   are, so career stats and photos set elsewhere survive an edit here. */
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
    photo_url: athlete.photo_url,
    photo_thumbnail_url: athlete.photo_thumbnail_url,
    photo_large_url: athlete.photo_large_url,
  }
}
