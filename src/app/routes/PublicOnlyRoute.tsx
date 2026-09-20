import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { SessionSplash } from '@/shared/ui'

interface LocationState {
  from?: { pathname: string }
}

/**
 * Inverse of `ProtectedRoute`: keeps an already-signed-in user off the login
 * screen, returning them to wherever the guard originally intercepted them.
 */
export function PublicOnlyRoute() {
  const status = useSessionStore((state) => state.status)
  const location = useLocation()

  if (status === 'checking') {
    return <SessionSplash />
  }

  if (status === 'authenticated') {
    const state = location.state as LocationState | null
    return <Navigate to={state?.from?.pathname ?? '/dashboard'} replace />
  }

  return <Outlet />
}
