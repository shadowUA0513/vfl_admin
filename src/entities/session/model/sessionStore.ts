import { create } from 'zustand'
import { setUnauthorizedHandler } from '@/shared/api'
import { clearToken, isSessionExpired, readToken, writeToken } from '@/shared/lib/auth-token'
import type { User } from '@/entities/user/@x/session'

/* `checking` covers the gap between a reload and the /auth/me response: a
   token exists but hasn't been validated yet, so the guards must wait rather
   than bounce the user to /login and lose their destination. */
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous'

interface SessionState {
  status: AuthStatus
  user: User | null
  token: string | null
  /* Set when the session ended on its own rather than by the user clicking
     Log out, so the login screen can say why they are back there. */
  expired: boolean
  signIn: (token: string, user: User, expiresAt?: string) => void
  signOut: () => void
  expireSession: () => void
  setUser: (user: User) => void
  markAnonymous: () => void
}

/* A token that is already past its expiry is dropped before the store is
   even created, so a reload on a dead session goes straight to the login
   screen instead of firing a request that is certain to 401. */
function restoreToken(): string | null {
  if (isSessionExpired()) {
    clearToken()
    return null
  }
  return readToken()
}

const restored = restoreToken()

export const useSessionStore = create<SessionState>((set) => ({
  /* If there's no usable token there is nothing to validate, so start as
     anonymous and skip the bootstrap request entirely. */
  status: restored ? 'checking' : 'anonymous',
  user: null,
  token: restored,
  expired: false,

  signIn: (token, user, expiresAt) => {
    writeToken(token, expiresAt)
    set({ status: 'authenticated', token, user, expired: false })
  },

  signOut: () => {
    clearToken()
    set({ status: 'anonymous', token: null, user: null, expired: false })
  },

  expireSession: () => {
    clearToken()
    set({ status: 'anonymous', token: null, user: null, expired: true })
  },

  setUser: (user) => set({ status: 'authenticated', user }),

  /* Reached from the 401 interceptor. Flagged as expired too: from the
     user's side an unusable token is an ended session either way. */
  markAnonymous: () => set({ status: 'anonymous', token: null, user: null, expired: true }),
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
