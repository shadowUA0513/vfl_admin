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

/* The API defaults to 20 rows per page. Admin lists are not paginated in the
   UI yet, so one large page is requested instead of silently showing the
   first 20 of a longer list. */
const LIST_LIMIT = 100

/** Some endpoints return the envelope, others a bare array. Handle both. */
function unwrapList<T>(payload: ListEnvelope<T> | T[] | null): T[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

export interface ResourceApi<T, TInput> {
  list(): Promise<T[]>
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
    async list() {
      if (USING_MOCK_API) return mock.list()
      const { data } = await api.get<ListEnvelope<T> | T[]>(config.readPath, {
        params: { limit: LIST_LIMIT },
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

    useList() {
      return useQuery({ queryKey: keys.list, queryFn: resourceApi.list })
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
