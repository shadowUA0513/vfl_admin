import { Navigate, Route, Routes } from 'react-router'
import { useSessionBootstrap } from '@/entities/session'
import { DashboardPage } from '@/pages/dashboard'
import { DesignSystemPage } from '@/pages/design-system'
import { ForbiddenPage, NotFoundPage } from '@/pages/errors'
import { EventsPage } from '@/pages/events'
import { FightersPage } from '@/pages/fighters'
import { LoginPage } from '@/pages/login'
import { AdminLayout } from '@/widgets/admin-layout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRoutes() {
  /* Runs above the routes so a stored token is validated before any guard
     decides where to send the user. */
  useSessionBootstrap()

  return (
    <Routes>
      {/* Signed out only — an authenticated user visiting /login is sent on. */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Any valid session. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Route>
      </Route>

      {/* Editor and above. Nested inside the same layout so the chrome does
          not unmount when moving between permission levels. */}
      <Route element={<ProtectedRoute minimumRole="editor" />}>
        <Route element={<AdminLayout />}>
          <Route path="/events" element={<EventsPage />} />
          <Route path="/fighters" element={<FightersPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Unknown paths are still gated: a signed-out user gets the login
          screen rather than a 404 that leaks which routes exist. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
