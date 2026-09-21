/* Cross-import API for the `ranking` entity: a snapshot embeds the champion
   and each entry's athlete, so it needs this type to describe them. */
export type { Athlete } from '../model/types'
export { athleteName } from '../model/types'
