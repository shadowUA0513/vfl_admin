/* Mirrors model.Event / dto.CreateEventRequest. */

export type EventStatus = 'scheduled' | 'completed' | 'cancelled'

export interface VflEvent {
  id: string
  name: string
  /** RFC3339 timestamp. Required by the API. */
  starts_at: string
  subtitle?: string
  venue_name?: string
  city?: string
  region?: string
  country?: string
  status?: EventStatus
  /* Card segments. A fight night runs early prelims -> prelims -> main
     card, each with its own broadcast time. */
  early_prelims_at?: string
  prelims_at?: string
  main_card_at?: string
  broadcast_platform?: string
  ticket_url?: string
  slug?: string
}

export interface VflEventInput {
  name: string
  starts_at: string
  subtitle?: string
  venue_name?: string
  city?: string
  region?: string
  country?: string
  status?: EventStatus
  early_prelims_at?: string
  prelims_at?: string
  main_card_at?: string
  broadcast_platform?: string
  ticket_url?: string
}

export const EVENT_STATUSES: EventStatus[] = ['scheduled', 'completed', 'cancelled']

/* The API takes and returns RFC3339 timestamps, but `datetime-local` inputs
   speak `YYYY-MM-DDTHH:mm` in the viewer's own timezone. These two convert
   between the pair, which is the only place timezone handling happens. */

export function isoToLocalInput(iso: string | undefined): string {
  if (!iso) return ''
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  const offsetMs = parsed.getTimezoneOffset() * 60_000
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function localInputToIso(local: string): string {
  if (!local) return ''
  const parsed = new Date(local)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

/** Narrows a fetched event to the fields the admin form owns. */
export function toEventInput(event: VflEvent): VflEventInput {
  return {
    name: event.name,
    starts_at: event.starts_at,
    subtitle: event.subtitle,
    venue_name: event.venue_name,
    city: event.city,
    region: event.region,
    country: event.country,
    status: event.status,
    early_prelims_at: event.early_prelims_at,
    prelims_at: event.prelims_at,
    main_card_at: event.main_card_at,
    broadcast_platform: event.broadcast_platform,
    ticket_url: event.ticket_url,
  }
}

/* Optional timestamps must be dropped rather than sent as '' — the API
   parses them as RFC3339 and rejects an empty string outright. */
export function optionalIso(local: string | undefined): string | undefined {
  return localInputToIso(local ?? '') || undefined
}
