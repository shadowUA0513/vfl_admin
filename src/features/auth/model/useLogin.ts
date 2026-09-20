import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { login, useSessionStore } from '@/entities/session'

interface LocationState {
  from?: { pathname: string }
}

/**
 * Login interaction: authenticate, store the session, land the user on the
 * page they were originally headed for.
 */
export function useLogin() {
  const signIn = useSessionStore((state) => state.signIn)
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      signIn(token, user)
      /* Return the user to the page the guard intercepted, or the dashboard
         on a direct visit. `replace` keeps /login out of history so Back
         doesn't land on a screen they can no longer see. */
      const state = location.state as LocationState | null
      navigate(state?.from?.pathname ?? '/dashboard', { replace: true })
    },
  })
}
