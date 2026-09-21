import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, createResourceApi, createResourceQueries } from '@/shared/api'
import { USING_MOCK_API } from '@/shared/config/env'
import type { RankingSnapshot, RankingSnapshotInput } from '../model/types'

const SEED: RankingSnapshot[] = []

/* The admin list lives at /admin/rankings, but that path has no GET for a
   single snapshot — detail comes from the public /rankings/snapshots/{id}. */
export const rankingApi = createResourceApi<RankingSnapshot, RankingSnapshotInput>(
  {
    readPath: '/admin/rankings',
    detailPath: '/rankings/snapshots',
    writePath: '/admin/rankings',
    mockKey: 'rankings',
  },
  SEED,
)

export const rankingQueries = createResourceQueries<RankingSnapshot, RankingSnapshotInput>(
  'rankings',
  rankingApi,
)

async function publish(id: string): Promise<void> {
  if (USING_MOCK_API) return
  await api.post(`/admin/rankings/${id}/publish`)
}

/**
 * Moves a draft snapshot to published. Separate from the generic CRUD
 * surface because no other resource has a lifecycle step.
 */
export function usePublishRanking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rankingQueries.keys.all }),
  })
}
