/* Mirrors model.Division / dto.CreateDivisionRequest. */

export type DivisionGender = 'men' | 'women'
/* A pound-for-pound board has no weight limit, which is why the limit is
   optional and the form hides it for that kind. */
export type DivisionKind = 'weight_class' | 'pound_for_pound'

export interface Division {
  id: string
  name: string
  gender: DivisionGender
  kind: DivisionKind
  weight_limit_lbs?: number
  slug?: string
  sort_order?: number
}

export interface DivisionInput {
  name: string
  gender: DivisionGender
  kind: DivisionKind
  weight_limit_lbs?: number
  sort_order?: number
}

export const DIVISION_GENDERS: DivisionGender[] = ['men', 'women']
export const DIVISION_KINDS: DivisionKind[] = ['weight_class', 'pound_for_pound']

export function divisionKindLabel(kind: DivisionKind): string {
  return kind === 'pound_for_pound' ? 'Pound for Pound' : 'Weight Class'
}

/** Narrows a fetched division to the fields the admin form owns. */
export function toDivisionInput(division: Division): DivisionInput {
  return {
    name: division.name,
    gender: division.gender,
    kind: division.kind,
    weight_limit_lbs: division.weight_limit_lbs,
    sort_order: division.sort_order,
  }
}
