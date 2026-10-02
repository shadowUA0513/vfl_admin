import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { USING_MOCK_API } from '@/shared/config/env'

/* POST /admin/events/{id}/generate-banner — draws the fight-card poster from
   what the database already holds. The event itself is not touched; the
   returned URL only becomes the event's banner if it is saved as one. */

export interface GeneratedBanner {
  url: string
  /** What the style asked for that the generator could not apply. */
  notes: string[]
}

/* With no style the server's built-in look is instant, but a styled render
   can take up to a minute — well past the client's default timeout. */
const STYLED_TIMEOUT_MS = 90_000

export async function generateBanner(eventId: string, style?: string): Promise<GeneratedBanner> {
  const trimmed = style?.trim()

  if (USING_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { url: 'https://placehold.co/1080x1350/png?text=VFL+Fight+Card', notes: [] }
  }

  const { data } = await api.post<{ url: string; notes?: string[] | null }>(
    `/admin/events/${eventId}/generate-banner`,
    trimmed ? { style: trimmed } : {},
    { timeout: STYLED_TIMEOUT_MS },
  )
  return { url: data.url, notes: data.notes ?? [] }
}

/** The last banner drawn for an event, with the style it was drawn in. */
export interface LastBanner extends GeneratedBanner {
  style: string
}

/* Not a fetch — there is no endpoint that returns a past banner — but the
   query cache is where the last one is kept, so closing the dialog or
   leaving the page does not throw a finished render away. Kept off the
   'events' key so list invalidations never touch it. */
const lastBannerKey = (eventId: string) => ['event-banners', eventId] as const

export function useLastBanner(eventId: string | undefined) {
  return useQuery<LastBanner | null>({
    queryKey: lastBannerKey(eventId ?? ''),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useGenerateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, style }: { eventId: string; style?: string }) =>
      generateBanner(eventId, style),
    meta: { successMessage: 'Banner generated', errorMessage: 'Could not generate banner' },
    onSuccess: (banner, { eventId, style }) => {
      queryClient.setQueryData<LastBanner>(lastBannerKey(eventId), {
        ...banner,
        style: style?.trim() ?? '',
      })
    },
  })
}
