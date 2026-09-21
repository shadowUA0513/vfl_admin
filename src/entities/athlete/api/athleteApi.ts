import { createResourceApi, createResourceQueries } from '@/shared/api'
import type { Athlete, AthleteInput } from '../model/types'

/* Seed rows for the local mock only. Ignored once VITE_API_URL is set. */
const SEED: Athlete[] = [
  { id: 'a_1', first_name: 'Dauren', last_name: 'Ismailov', nickname: 'The Steppe Wolf', country: 'KZ', status: 'active', wins: 18, losses: 2, draws: 0 },
  { id: 'a_2', first_name: 'Marco', last_name: 'Silva', nickname: 'Tempest', country: 'BR', status: 'active', wins: 15, losses: 4, draws: 1 },
  { id: 'a_3', first_name: 'Timur', last_name: 'Abdiev', nickname: 'Iron', country: 'UZ', status: 'active', wins: 21, losses: 3, draws: 0 },
]

export const athleteApi = createResourceApi<Athlete, AthleteInput>(
  { readPath: '/athletes', writePath: '/admin/athletes', mockKey: 'athletes' },
  SEED,
)
export const athleteQueries = createResourceQueries<Athlete, AthleteInput>('athletes', athleteApi)
