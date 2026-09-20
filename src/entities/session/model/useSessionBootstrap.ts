import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchCurrentUser } from '../api/sessionApi'
import { useSessionStore } from './sessionStore'

export const SESSION_QUERY_KEY = ['session', 'me'] as const

/**
 * Validates a stored token once on app start. Mounted above the router so
 * the result is settled before any guard makes a decision.
 */
export function useSessionBootstrap(): void {
  const status = useSessionStore((state) => state.status)
  const setUser = useSessionStore((state) => state.setUser)
  const markAnonymous = useSessionStore((state) => state.markAnonymous)

  const { data, isError } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: status === 'checking',
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  useEffect(() => {
    /* Any failure ends the session, including a network error on a token
       that may still be good. Showing the login screen is the safe read of
       "we could not confirm who you are"; the alternative is letting an
       unverified session into the admin. */
    if (isError) markAnonymous()
  }, [isError, markAnonymous])
}
