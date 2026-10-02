import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { apiErrorMessage } from '@/shared/api'
import { notifyError, notifySuccess } from '@/shared/lib/notify'

/* What a query or mutation says about itself in a toast. Set through
   `meta` where the hook is defined, so the pages never have to remember
   to notify. */
interface NotifyMeta extends Record<string, unknown> {
  /** Toast on success. Mutations only; reads succeed quietly. */
  successMessage?: string
  /** Title for the error toast, e.g. "Could not save athlete". */
  errorMessage?: string
  /** No toast at all, for calls whose failure the screen already explains. */
  silent?: boolean
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: NotifyMeta
    mutationMeta: NotifyMeta
  }
}

/* A 401 already sends the user back to the login screen; a toast on top of
   that, one per in-flight request, would only be noise. */
function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent || isUnauthorized(error)) return
      notifyError(
        apiErrorMessage(error),
        query.meta?.errorMessage ?? 'Could not load data',
        query.queryHash,
      )
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.successMessage
      if (message && !mutation.meta?.silent) notifySuccess(message)
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent || isUnauthorized(error)) return
      notifyError(apiErrorMessage(error), mutation.meta?.errorMessage ?? 'Request failed')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
