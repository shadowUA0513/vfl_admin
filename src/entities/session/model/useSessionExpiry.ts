import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { isSessionExpired, msUntilExpiry } from '@/shared/lib/auth-token'
import { useSessionStore } from './sessionStore'

/* setTimeout stores its delay in a signed 32-bit int. Anything larger
   overflows and fires immediately, which would look like an instant logout.
   The token lasts ~24h so this is only a guard, but a re-arming ceiling is
   cheap and removes the failure mode entirely. */
const MAX_TIMEOUT_MS = 2_147_483_647

/**
 * Signs the user out the moment the token expires, rather than waiting for
 * the next request to come back 401.
 *
 * The 401 interceptor stays as the backstop — it still catches a token
 * revoked server-side, or clocks that disagree by more than the skew
 * allowance. This hook covers the case the interceptor cannot: an idle tab
 * making no requests at all.
 */
export function useSessionExpiry(): void {
  const status = useSessionStore((state) => state.status)
  const expireSession = useSessionStore((state) => state.expireSession)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status !== 'authenticated') return

    const endSession = () => {
      expireSession()
      /* Same reasoning as an explicit logout: drop every cached response so
         the next person to sign in cannot see the previous user's data. */
      queryClient.clear()
    }

    if (isSessionExpired()) {
      endSession()
      return
    }

    let timer: number

    const arm = () => {
      const remaining = msUntilExpiry()
      /* No known expiry — nothing to schedule. The interceptor covers it. */
      if (remaining === null) return

      if (remaining <= 0) {
        endSession()
        return
      }
      timer = window.setTimeout(arm, Math.min(remaining, MAX_TIMEOUT_MS))
    }

    arm()

    /* Timers do not fire reliably while a machine is asleep, so a laptop
       reopened after the token died would otherwise sit on a stale admin
       screen. Re-checking whenever the tab is looked at again covers it. */
    const recheck = () => {
      if (document.visibilityState === 'visible' && isSessionExpired()) {
        endSession()
      }
    }

    document.addEventListener('visibilitychange', recheck)
    window.addEventListener('focus', recheck)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', recheck)
      window.removeEventListener('focus', recheck)
    }
  }, [status, expireSession, queryClient])
}
