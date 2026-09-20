import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { hasRole, type Role } from '@/entities/user'
import { SessionSplash } from '@/shared/ui'

interface ProtectedRouteProps {
  /** Lowest role allowed through. Omit to require only a valid session. */
  minimumRole?: Role
}

/**
 * Layout route guard. Renders nested routes via `Outlet` once the session is
 * confirmed, otherwise sends the user to the login screen.
 */
export function ProtectedRoute({ minimumRole }: ProtectedRouteProps) {
  const status = useSessionStore((state) => state.status)
  const user = useSessionStore((state) => state.user)
  const location = useLocation()

  /* Still validating a stored token. Rendering the splash rather than
     redirecting is what keeps a refresh on a deep link from bouncing the
     user to /login and back. */
  if (status === 'checking') {
    return <SessionSplash />
  }

  if (status === 'anonymous') {
    /* `from` carries the blocked destination so login can return the user
       to where they were actually headed. */
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (minimumRole && !hasRole(user, minimumRole)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
