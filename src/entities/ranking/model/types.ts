import type { Athlete } from '@/entities/athlete/@x/ranking'
import type { Division } from '@/entities/division/@x/ranking'

/* Mirrors model.RankingSnapshot / dto.CreateRankingSnapshotRequest.

   A ranking is not one row per athlete. It is a snapshot per division: a
   champion, plus an ordered list of ranked contenders, saved as a draft and
   then published. */

export type ChampionLabel = 'champion' | 'interim_champion' | 'vacant'
export type SnapshotStatus = 'draft' | 'published'

export interface RankingEntry {
  id: string
  snapshot_id?: string
  athlete_id: string
  rank: number
  /** Embedded by the API on read. */
  athlete?: Athlete
  previous_rank?: number
  change?: number
  direction?: string
}

export interface RankingSnapshot {
  id: string
  division_id: string
  /** Embedded by the API on read. */
  division?: Division
  champion_id?: string
  champion?: Athlete
  champion_label?: ChampionLabel
  entries?: RankingEntry[]
  notes?: string
  status?: SnapshotStatus
  published_at?: string
}

/** dto.RankingEntryInput */
export interface RankingEntryInput {
  athlete_id: string
  rank: number
}

/**
 * dto.CreateRankingSnapshotRequest.
 *
 * `division_id` is absent from the *update* DTO — a snapshot cannot be moved
 * to another division after it is created, which is why the edit form shows
 * the division as fixed rather than as a select.
 */
export interface RankingSnapshotInput {
  division_id: string
  entries: RankingEntryInput[]
  champion_id?: string
  champion_label?: ChampionLabel
  notes?: string
}

export const CHAMPION_LABELS: ChampionLabel[] = ['champion', 'interim_champion', 'vacant']

export function championLabelText(label: ChampionLabel | undefined): string {
  if (label === 'interim_champion') return 'Interim Champion'
  if (label === 'vacant') return 'Vacant'
  if (label === 'champion') return 'Champion'
  return '—'
}

/** Contenders are ranked from 1; the champion sits outside the ladder. */
export function formatRank(rank: number): string {
  return `#${rank}`
}

/** Narrows a fetched snapshot to the fields the form owns. */
export function toRankingSnapshotInput(snapshot: RankingSnapshot): RankingSnapshotInput {
  return {
    division_id: snapshot.division_id,
    champion_id: snapshot.champion_id,
    champion_label: snapshot.champion_label,
    notes: snapshot.notes,
    entries: [...(snapshot.entries ?? [])]
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => ({ athlete_id: entry.athlete_id, rank: entry.rank })),
  }
}
