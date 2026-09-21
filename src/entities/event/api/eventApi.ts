import { createResourceApi, createResourceQueries } from '@/shared/api'
import type { VflEvent, VflEventInput } from '../model/types'

const SEED: VflEvent[] = [
  { id: 'e_1', name: 'VFL 18: Ismailov vs Silva', starts_at: '2026-10-11T18:00:00Z', venue_name: 'Humo Arena', city: 'Tashkent', country: 'UZ', status: 'scheduled' },
  { id: 'e_2', name: 'VFL 19: Abdiev vs Watanabe', starts_at: '2026-11-22T18:00:00Z', venue_name: 'Ariake Arena', city: 'Tokyo', country: 'JP', status: 'scheduled' },
]

export const eventApi = createResourceApi<VflEvent, VflEventInput>(
  { readPath: '/events', writePath: '/admin/events', mockKey: 'events' },
  SEED,
)
export const eventQueries = createResourceQueries<VflEvent, VflEventInput>('events', eventApi)
