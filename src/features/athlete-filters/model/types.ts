/* What the athletes list is narrowed by. Held as its own shape rather than
   three loose pieces of state, so the page passes one thing around and
   clearing is a single assignment. */

export interface AthleteFilterState {
  search: string
  divisionId: string | null
  status: string | null
}

export const EMPTY_ATHLETE_FILTERS: AthleteFilterState = {
  search: '',
  divisionId: null,
  status: null,
}

/** Whether anything is actually narrowing the list. */
export function hasActiveFilters(filters: AthleteFilterState): boolean {
  return Boolean(filters.search.trim() || filters.divisionId || filters.status)
}
