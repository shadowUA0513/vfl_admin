/* Cross-import API for the `session` entity.
   FSD forbids entity slices importing each other directly; the `@x` folder
   is the sanctioned exception, and naming the file after the consumer makes
   the coupling visible from this side. */
export type { User, Role } from '../model/types'
