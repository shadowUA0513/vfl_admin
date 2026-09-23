import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { USING_MOCK_API } from '@/shared/config/env'
import { createMockCollection, type Identified } from '@/shared/lib/mock-db'
import { api } from './client'

/* One REST resource, one set of query hooks.

   The VFL API splits reads from writes: lists and detail are public
   (`GET /athletes`), everything that mutates sits behind the admin prefix
   (`POST /admin/athletes`). So a resource is configured with two paths
   rather than one.

   Lists come back in an envelope — `{ data, meta }` — which is unwrapped
   here so callers keep receiving a plain array. */

export interface ResourceConfig {
  /** Public read path, e.g. `/athletes`. */
  readPath: string
  /** Admin write path, e.g. `/admin/athletes`. */
  writePath: string
  /* Where a single record is fetched from, when that is not just
     `readPath/{id}`. Rankings need this: the admin list lives at
     /admin/rankings but there is no GET for one snapshot there, so detail
     comes from the public /rankings/snapshots/{id}. */
  detailPath?: string
  /** Key for the local mock collection when no API is configured. */
  mockKey: string
}

export interface ListMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

interface ListEnvelope<T> {
  data: T[] | null
  meta: ListMeta
}

/* What a caller gets when it asks for no particular page.

   The list screens pass their own, smaller `limit`. This default is for
   everything else — the selects in the forms, which need the whole roster
   in one go rather than a page of it. */
const LIST_LIMIT = 100

/** Rows for the page that was asked for, plus where that page sits. */
export interface ListResult<T> {
  rows: T[]
  meta: ListMeta
}

/* Some endpoints return the envelope, others a bare array. A bare array is
   the whole result by definition, so it gets a one-page meta rather than
   leaving callers to handle a missing one. */
function unwrapList<T>(payload: ListEnvelope<T> | T[] | null): ListResult<T> {
  if (Array.isArray(payload)) {
    return {
      rows: payload,
      meta: { page: 1, limit: payload.length, total: payload.length, total_pages: 1 },
    }
  }

  if (payload && Array.isArray(payload.data)) {
    return { rows: payload.data, meta: payload.meta }
  }

  return { rows: [], meta: { page: 1, limit: 0, total: 0, total_pages: 0 } }
}

/**
 * Query string for a list request — `search`, `division_id`, `status` and
 * the like, which the API applies server-side.
 *
 * Kept open rather than typed per resource: every list endpoint takes a
 * different set, and this layer only has to pass them along.
 */
export type ListParams = Record<string, string | number | undefined>

/**
 * Drops blanks, and returns undefined when nothing is left.
 *
 * An empty select reads as '' or null, which would otherwise be sent as
 * `?status=` and narrow the results to nothing. Collapsing an all-blank set
 * to undefined also keeps an unfiltered list on one cache entry rather than
 * one per shape of empty filter object.
 */
export function cleanListParams(params: ListParams | undefined): ListParams | undefined {
  if (!params) return undefined

  const cleaned: ListParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    cleaned[key] = value
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

export interface ResourceApi<T, TInput> {
  list(params?: ListParams): Promise<ListResult<T>>
  get(id: string): Promise<T>
  create(input: TInput): Promise<T>
  update(id: string, input: TInput): Promise<T>
  remove(id: string): Promise<void>
}

export function createResourceApi<T extends Identified, TInput>(
  config: ResourceConfig,
  seed: T[],
): ResourceApi<T, TInput> {
  const mock = createMockCollection<T, TInput>(config.mockKey, seed)

  return {
    async list(params) {
      /* The mock has no query support, so it returns everything on one
         page — unfiltered and unpaginated. Only reachable with no API
         configured, where the point is to render the screens at all. */
      if (USING_MOCK_API) {
        const rows = await mock.list()
        return {
          rows,
          meta: { page: 1, limit: rows.length, total: rows.length, total_pages: 1 },
        }
      }

      const { data } = await api.get<ListEnvelope<T> | T[]>(config.readPath, {
        params: { limit: LIST_LIMIT, ...cleanListParams(params) },
      })
      return unwrapList<T>(data)
    },
    async get(id) {
      if (USING_MOCK_API) return mock.get(id)
      const { data } = await api.get<T>(`${config.detailPath ?? config.readPath}/${id}`)
      return data
    },
    async create(input) {
      if (USING_MOCK_API) return mock.create(input)
      const { data } = await api.post<T>(config.writePath, input)
      return data
    },
    async update(id, input) {
      if (USING_MOCK_API) return mock.update(id, input)
      const { data } = await api.put<T>(`${config.writePath}/${id}`, input)
      return data
    },
    async remove(id) {
      if (USING_MOCK_API) return mock.remove(id)
      await api.delete(`${config.writePath}/${id}`)
    },
  }
}

export interface UpdateArgs<TInput> {
  id: string
  input: TInput
}

/**
 * React Query hooks for a resource. Every mutation invalidates the whole
 * resource rather than patching the cache: these lists are small and admin
 * edits are infrequent, so a refetch is cheaper than keeping hand-written
 * cache updates correct as the shapes change.
 */
export function createResourceQueries<T extends Identified, TInput>(
  resource: string,
  resourceApi: ResourceApi<T, TInput>,
) {
  const keys = {
    all: [resource] as const,
    list: [resource, 'list'] as const,
    detail: (id: string) => [resource, 'detail', id] as const,
  }

  function useInvalidate() {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: keys.all })
  }

  return {
    keys,

    /* Filters and the page are part of the cache key, so each combination
       is its own entry and going back to one is instant. `keys.all` still
       covers them all, so a mutation invalidates every page of every
       filtered list. */
    useListPage(params?: ListParams) {
      const cleaned = cleanListParams(params)
      return useQuery({
        queryKey: cleaned ? [...keys.list, cleaned] : keys.list,
        queryFn: () => resourceApi.list(cleaned),
        /* Keeps the previous rows on screen while the next page or a new
           filter loads, so the list dims rather than collapsing to a
           spinner on every keystroke and page click. */
        placeholderData: (previous) => previous,
      })
    },

    /* The rows alone, for callers with nothing to paginate — the selects in
       the forms, which want the whole roster rather than a page of it.
       Same query as useListPage, so asking for both costs one request. */
    useList(params?: ListParams) {
      const cleaned = cleanListParams(params)
      return useQuery({
        queryKey: cleaned ? [...keys.list, cleaned] : keys.list,
        queryFn: () => resourceApi.list(cleaned),
        select: (result) => result.rows,
        placeholderData: (previous) => previous,
      })
    },

    useItem(id: string | undefined) {
      return useQuery({
        queryKey: keys.detail(id ?? ''),
        queryFn: () => resourceApi.get(id as string),
        enabled: Boolean(id),
      })
    },

    useCreate() {
      const invalidate = useInvalidate()
      return useMutation({
        mutationFn: (input: TInput) => resourceApi.create(input),
        onSuccess: invalidate,
      })
    },

    useUpdate() {
      const invalidate = useInvalidate()
      return useMutation({
        mutationFn: ({ id, input }: UpdateArgs<TInput>) => resourceApi.update(id, input),
        onSuccess: invalidate,
      })
    },

    useRemove() {
      const invalidate = useInvalidate()
      return useMutation({
        mutationFn: (id: string) => resourceApi.remove(id),
        onSuccess: invalidate,
      })
    },
  }
}
