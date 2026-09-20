import { create } from 'zustand'
import { setUnauthorizedHandler } from '@/shared/api'
import { clearToken, readToken, writeToken } from '@/shared/lib/auth-token'
import type { User } from '@/entities/user/@x/session'

/* `checking` covers the gap between a reload and the /auth/me response: a
   token exists but hasn't been validated yet, so the guards must wait rather
   than bounce the user to /login and lose their destination. */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

interface SessionState {
  status: AuthStatus
  user: User | null
  token: string | null
  signIn: (token: string, user: User) => void
  signOut: () => void
  setUser: (user: User) => void
  markAnonymous: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  /* If there's no token at all there is nothing to validate, so start as
     anonymous and skip the bootstrap request entirely. */
  status: readToken() ? 'checking' : 'anonymous',
  user: null,
  token: readToken(),

  signIn: (token, user) => {
    writeToken(token)
    set({ status: 'authenticated', token, user })
  },

  signOut: () => {
    clearToken()
    set({ status: 'anonymous', token: null, user: null })
  },

  setUser: (user) => set({ status: 'authenticated', user }),

  markAnonymous: () => set({ status: 'anonymous', token: null, user: null }),
}))

/* Any 401 from any request tears the session down, not just ones from the
   auth endpoints — an expired token shows up on whatever request happens to
   fire first. Registered once at module load. */
setUnauthorizedHandler(() => {
  useSessionStore.getState().markAnonymous()
})

/* Selectors kept next to the store so components subscribe to one field and
   don't re-render on unrelated session changes. */
export const selectUser = (state: SessionState) => state.user
export const selectStatus = (state: SessionState) => state.status
