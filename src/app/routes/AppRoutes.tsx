import { Navigate, Route, Routes } from 'react-router'
import { useSessionBootstrap, useSessionExpiry } from '@/entities/session'
import { AthleteCreatePage, AthleteEditPage, AthletesListPage } from '@/pages/athletes'
import { DashboardPage } from '@/pages/dashboard'
import { DivisionCreatePage, DivisionEditPage, DivisionsListPage } from '@/pages/divisions'
import { ForbiddenPage, NotFoundPage } from '@/pages/errors'
import { EventCreatePage, EventEditPage, EventsListPage } from '@/pages/events'
import { LoginPage } from '@/pages/login'
import { RankingCreatePage, RankingEditPage, RankingsListPage } from '@/pages/rankings'
import { AdminLayout } from '@/widgets/admin-layout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRoutes() {
  /* Runs above the routes so a stored token is validated before any guard
     decides where to send the user. */
  useSessionBootstrap()

  /* Ends the session the moment the token expires; the guards then send the
     user to /login on the next render. */
  useSessionExpiry()

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
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Route>
      </Route>

      {/* Editor and above. Nested inside the same layout so the chrome does
          not unmount when moving between permission levels. */}
      <Route element={<ProtectedRoute minimumRole="editor" />}>
        <Route element={<AdminLayout />}>
          <Route path="/athletes" element={<AthletesListPage />} />
          <Route path="/athletes/new" element={<AthleteCreatePage />} />
          <Route path="/athletes/:id/edit" element={<AthleteEditPage />} />

          <Route path="/events" element={<EventsListPage />} />
          <Route path="/events/new" element={<EventCreatePage />} />
          <Route path="/events/:id/edit" element={<EventEditPage />} />

          <Route path="/rankings" element={<RankingsListPage />} />
          <Route path="/rankings/new" element={<RankingCreatePage />} />
          <Route path="/rankings/:id/edit" element={<RankingEditPage />} />

          <Route path="/divisions" element={<DivisionsListPage />} />
          <Route path="/divisions/new" element={<DivisionCreatePage />} />
          <Route path="/divisions/:id/edit" element={<DivisionEditPage />} />
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
