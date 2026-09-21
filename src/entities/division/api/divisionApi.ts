import { createResourceApi, createResourceQueries } from '@/shared/api'
import type { Division, DivisionInput } from '../model/types'

const SEED: Division[] = [
  { id: 'd_1', name: 'Flyweight', gender: 'men', kind: 'weight_class', weight_limit_lbs: 125, sort_order: 1 },
  { id: 'd_2', name: 'Lightweight', gender: 'men', kind: 'weight_class', weight_limit_lbs: 155, sort_order: 2 },
  { id: 'd_3', name: 'Welterweight', gender: 'men', kind: 'weight_class', weight_limit_lbs: 170, sort_order: 3 },
  { id: 'd_4', name: 'Strawweight', gender: 'women', kind: 'weight_class', weight_limit_lbs: 115, sort_order: 4 },
]

export const divisionApi = createResourceApi<Division, DivisionInput>(
  { readPath: '/divisions', writePath: '/admin/divisions', mockKey: 'divisions' },
  SEED,
)
export const divisionQueries = createResourceQueries<Division, DivisionInput>('divisions', divisionApi)
