import type { Athlete } from '@/entities/athlete/@x/bout'
import type { Division } from '@/entities/division/@x/bout'

/* Mirrors model.Bout / dto.CreateBoutRequest.

   A bout is not a top-level resource: it only exists under an event
   (`/admin/events/{id}/bouts`), which is why it has no list screen of its
   own and is edited inside the event form.

   The two fighters are the red and the blue corner. Which corner a fighter
   is in is not cosmetic — the red corner is conventionally the favourite or
   the returning champion, and it is the order every broadcast graphic and
   scorecard is built from. */

export type BoutSegment = 'early_prelims' | 'prelims' | 'main_card'
export type BoutOutcome = 'win' | 'draw' | 'no_contest'
export type BoutMethod = 'ko_tko' | 'submission' | 'decision' | 'dq' | 'other'

export interface Bout {
  id: string
  event_id: string
  red_corner_id: string
  blue_corner_id: string
  /** Embedded by the API on read. */
  red_corner?: Athlete
  blue_corner?: Athlete
  division_id?: string
  division?: Division
  segment: BoutSegment
  /** Order on the card, assigned by the server from the bout-order call. */
  position?: number
  scheduled_rounds?: number
  is_title_fight?: boolean
  is_main_event?: boolean
  weight_class_label?: string
  /* Result fields. Written through a separate endpoint
     (`/bouts/{id}/result`), so the form below never sends them. */
  outcome?: BoutOutcome
  method?: BoutMethod
  method_detail?: string
  end_round?: number
  end_time?: string
  winner_id?: string
  winner?: Athlete
  result_recorded_at?: string
}

/** dto.CreateBoutRequest. `position` is absent from the update DTO. */
export interface BoutInput {
  red_corner_id: string
  blue_corner_id: string
  segment: BoutSegment
  division_id?: string
  scheduled_rounds?: number
  is_title_fight?: boolean
  is_main_event?: boolean
  weight_class_label?: string
  position?: number
}

/**
 * A bout as the event form holds it, before anything is saved.
 *
 * `id` is what separates a bout the server already knows about from one
 * added in this editing session — the save diffs on it. `key` exists because
 * a brand-new row has no id yet and React and dnd-kit both need a stable
 * identity for it from the moment it appears.
 */
export interface BoutDraft extends BoutInput {
  id?: string
  key: string
  /* The result, which is written through its own endpoint and never through
     BoutInput. Carried on the draft so the card can show who won, and left
     out of toBoutInput so saving the event cannot overwrite it. */
  outcome?: BoutOutcome
  winner_id?: string
  method?: BoutMethod
}

export const BOUT_SEGMENTS: BoutSegment[] = ['early_prelims', 'prelims', 'main_card']

/* Championship bouts are five rounds, everything else is three. One and two
   are legal per the API but effectively unused, so they are offered without
   being the obvious choice. */
export const SCHEDULED_ROUNDS = [1, 2, 3, 4, 5] as const
export const DEFAULT_ROUNDS = 3
export const TITLE_FIGHT_ROUNDS = 5

/* Swagger marks `method` optional on dto.SetBoutResultRequest, but the
   server rejects a win without one ("method is required when outcome is
   win"), so picking a winner means picking how they won. */
export const BOUT_METHODS: BoutMethod[] = ['ko_tko', 'submission', 'decision', 'dq', 'other']

export function methodLabel(method: BoutMethod | undefined): string {
  if (method === 'ko_tko') return 'KO/TKO'
  if (method === 'submission') return 'Submission'
  if (method === 'decision') return 'Decision'
  if (method === 'dq') return 'DQ'
  if (method === 'other') return 'Other'
  return '—'
}

export function segmentLabel(segment: BoutSegment): string {
  if (segment === 'early_prelims') return 'Early Prelims'
  if (segment === 'prelims') return 'Prelims'
  return 'Main Card'
}

let draftCounter = 0

/** Identity for a row that has no server id yet. Never sent to the API. */
export function nextDraftKey(): string {
  draftCounter += 1
  return `draft-${draftCounter}`
}

export function emptyBoutDraft(): BoutDraft {
  return {
    key: nextDraftKey(),
    red_corner_id: '',
    blue_corner_id: '',
    segment: 'main_card',
    scheduled_rounds: DEFAULT_ROUNDS,
    is_title_fight: false,
    is_main_event: false,
    division_id: '',
    weight_class_label: '',
  }
}

/** Narrows a fetched bout to the fields the event form owns. */
export function toBoutDraft(bout: Bout): BoutDraft {
  return {
    key: bout.id,
    id: bout.id,
    outcome: bout.outcome,
    winner_id: bout.winner_id,
    method: bout.method,
    red_corner_id: bout.red_corner_id,
    blue_corner_id: bout.blue_corner_id,
    segment: bout.segment,
    division_id: bout.division_id ?? '',
    scheduled_rounds: bout.scheduled_rounds ?? DEFAULT_ROUNDS,
    is_title_fight: bout.is_title_fight ?? false,
    is_main_event: bout.is_main_event ?? false,
    weight_class_label: bout.weight_class_label ?? '',
  }
}

/* Drafts carry '' for the empty selects, which the API rejects where it
   wants a uuid, so blanks are dropped on the way out. */
export function toBoutInput(draft: BoutDraft): BoutInput {
  return {
    red_corner_id: draft.red_corner_id,
    blue_corner_id: draft.blue_corner_id,
    segment: draft.segment,
    division_id: draft.division_id || undefined,
    scheduled_rounds: draft.scheduled_rounds ?? DEFAULT_ROUNDS,
    is_title_fight: Boolean(draft.is_title_fight),
    is_main_event: Boolean(draft.is_main_event),
    weight_class_label: draft.weight_class_label?.trim() || undefined,
  }
}

/** dto.SetBoutResultRequest. */
export interface BoutResultInput {
  outcome: BoutOutcome
  winner_id?: string
  method?: BoutMethod
  method_detail?: string
  end_round?: number
  end_time?: string
}

/**
 * Who won, or undefined while the bout is unresolved.
 *
 * A draw or a no-contest has an outcome but no winner, so the id alone is
 * not enough to tell "not fought yet" from "fought, nobody won".
 */
export function boutWinner(draft: BoutDraft): string | undefined {
  return draft.outcome === 'win' ? draft.winner_id : undefined
}

/**
 * A comparable stamp of a bout's result, for telling whether it changed.
 *
 * Changing only the method is still a change, so the method is part of the
 * stamp rather than just the winner.
 */
export function resultStamp(
  bout: { outcome?: string; winner_id?: string; method?: string } | undefined,
): string {
  if (bout?.outcome !== 'win') return ''
  return `win:${bout.winner_id ?? ''}:${bout.method ?? ''}`
}

/** Ordered by position, so the editor lists a card the way it is fought. */
export function sortBouts(bouts: Bout[]): Bout[] {
  return [...bouts].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

/**
 * Per-row problems, keyed by draft key, or an empty object when the card is
 * ready to save. Checked here rather than in Mantine's validators because
 * the bouts are held outside the event form's own values.
 */
export function validateBouts(drafts: BoutDraft[]): Record<string, string> {
  const errors: Record<string, string> = {}
  /* A fighter cannot be booked twice on the same card, so a repeat is
     reported on the second bout it appears in rather than the first. */
  const seen = new Map<string, number>()

  drafts.forEach((draft, index) => {
    if (!draft.red_corner_id || !draft.blue_corner_id) {
      errors[draft.key] = 'Pick a fighter for both corners'
      return
    }
    if (draft.red_corner_id === draft.blue_corner_id) {
      errors[draft.key] = 'A fighter cannot face themselves'
      return
    }

    for (const id of [draft.red_corner_id, draft.blue_corner_id]) {
      const first = seen.get(id)
      if (first !== undefined) {
        errors[draft.key] = `Already booked in bout ${first + 1}`
        return
      }
    }
    seen.set(draft.red_corner_id, index)
    seen.set(draft.blue_corner_id, index)
  })

  return errors
}
