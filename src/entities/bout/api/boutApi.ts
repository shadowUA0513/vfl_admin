import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { USING_MOCK_API } from '@/shared/config/env'
import { createMockCollection } from '@/shared/lib/mock-db'
import {
  resultStamp,
  sortBouts,
  toBoutInput,
  type Bout,
  type BoutDraft,
  type BoutInput,
  type BoutResultInput,
} from '../model/types'

/* Bouts hang off an event rather than standing on their own, so they cannot
   use createResourceApi: every path needs the event id, and there is an
   extra verb (bout-order) with no equivalent anywhere else. */

function base(eventId: string): string {
  return `/admin/events/${eventId}/bouts`
}

/* The mock keeps one flat collection and filters by event_id, mirroring how
   the server stores them. */
type MockBoutInput = BoutInput & { event_id: string }
const mock = createMockCollection<Bout, MockBoutInput>('bouts', [])

export async function listBouts(eventId: string): Promise<Bout[]> {
  if (USING_MOCK_API) {
    const rows = await mock.list()
    return sortBouts(rows.filter((bout) => bout.event_id === eventId))
  }
  const { data } = await api.get<Bout[] | null>(base(eventId))
  return sortBouts(data ?? [])
}

async function createBout(eventId: string, input: BoutInput): Promise<Bout> {
  if (USING_MOCK_API) return mock.create({ ...input, event_id: eventId })
  const { data } = await api.post<Bout>(base(eventId), input)
  return data
}

async function updateBout(eventId: string, boutId: string, input: BoutInput): Promise<Bout> {
  if (USING_MOCK_API) {
    /* The mock replaces the whole record, so the result fields — which this
       form never edits — are merged back in rather than dropped. */
    const current = await mock.get(boutId)
    return mock.update(boutId, { ...current, ...input, event_id: eventId })
  }
  const { data } = await api.put<Bout>(`${base(eventId)}/${boutId}`, input)
  return data
}

async function removeBout(eventId: string, boutId: string): Promise<void> {
  if (USING_MOCK_API) return mock.remove(boutId)
  await api.delete(`${base(eventId)}/${boutId}`)
}

async function reorderBouts(eventId: string, boutIds: string[]): Promise<void> {
  if (USING_MOCK_API) {
    const rows = await mock.list()
    for (const [index, id] of boutIds.entries()) {
      const row = rows.find((bout) => bout.id === id)
      if (row) await mock.update(id, { ...row, position: index + 1 })
    }
    return
  }
  await api.put(`${base(eventId)}/bout-order`, { bout_ids: boutIds })
}

/** Records who won a bout, or clears the result when `input` is null. */
async function recordResult(
  eventId: string,
  boutId: string,
  input: BoutResultInput | null,
): Promise<Bout> {
  if (USING_MOCK_API) {
    const current = await mock.get(boutId)
    const result: Partial<Bout> = input
      ? input
      : { outcome: undefined, winner_id: undefined, method: undefined, end_round: undefined }
    return mock.update(boutId, { ...current, ...result } as MockBoutInput)
  }

  const path = `${base(eventId)}/${boutId}/result`
  const { data } = input ? await api.put<Bout>(path, input) : await api.delete<Bout>(path)
  return data
}

export interface SyncBoutsArgs {
  eventId: string
  bouts: BoutDraft[]
}

/**
 * Makes the event's card match `bouts`, which is what the form holds.
 *
 * There is no endpoint that takes a whole card at once, so the difference is
 * worked out here: rows the editor dropped are deleted, rows it kept are
 * updated, rows it added are created, and a final bout-order call fixes the
 * positions once every bout has an id.
 *
 * The calls run one at a time on purpose. Deletes go first because the
 * server rejects a fighter booked twice on one card — swapping an opponent
 * between two bouts in a single save only works if the old booking is gone
 * before the new one is sent.
 */
export async function syncBouts({ eventId, bouts }: SyncBoutsArgs): Promise<void> {
  const existing = await listBouts(eventId)
  const kept = new Set(bouts.map((draft) => draft.id).filter(Boolean))

  for (const bout of existing) {
    if (!kept.has(bout.id)) await removeBout(eventId, bout.id)
  }

  const ordered: string[] = []
  for (const [index, draft] of bouts.entries()) {
    const input = toBoutInput(draft)
    let boutId: string

    if (draft.id) {
      await updateBout(eventId, draft.id, input)
      boutId = draft.id
    } else {
      /* Only the create DTO binds `position`; on update the order is the
         bout-order call's job. */
      const created = await createBout(eventId, { ...input, position: index + 1 })
      boutId = created.id
    }
    ordered.push(boutId)

    /* The result is a separate endpoint, so a bout whose winner changed
       needs a second call. Only an actual change is sent — re-asserting an
       unchanged result would have the server recompile two fighters'
       records for nothing. A bout created a moment ago has no result on the
       server, so anything the card says about one counts as a change. */
    const desired = resultStamp(draft)
    const current = resultStamp(existing.find((bout) => bout.id === draft.id))
    if (desired !== current) {
      await recordResult(
        eventId,
        boutId,
        desired
          ? { outcome: 'win', winner_id: draft.winner_id, method: draft.method }
          : null,
      )
    }
  }

  if (ordered.length > 1) await reorderBouts(eventId, ordered)
}

const keys = {
  all: ['bouts'] as const,
  list: (eventId: string) => ['bouts', 'list', eventId] as const,
}

export const boutQueries = {
  keys,

  useList(eventId: string | undefined) {
    return useQuery({
      queryKey: keys.list(eventId ?? ''),
      queryFn: () => listBouts(eventId as string),
      enabled: Boolean(eventId),
    })
  },

  /** Saves a whole card. Used by both the create and the edit page. */
  useSync() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: syncBouts,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all })
        /* A result moves the two fighters' win/loss record, which the API
           compiles server-side — so the athlete cache is now stale too. */
        queryClient.invalidateQueries({ queryKey: ['athletes'] })
      },
    })
  },
}
