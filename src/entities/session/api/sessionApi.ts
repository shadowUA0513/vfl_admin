import { api } from '@/shared/api'
import { USING_MOCK_API } from '@/shared/config/env'
import type { User } from '@/entities/user/@x/session'
import type { Credentials, LoginResponse } from '../model/types'
import { mockLogin, mockMe } from './mockSessionApi'

/* Assumed contract — adjust the three calls below to match the real API:
     POST /auth/login  { email, password }  -> { token, user }
     GET  /auth/me                          -> User
     POST /auth/logout                      -> 204
   Everything else in the app goes through this slice's public API, so a
   contract change stays contained to this file. */

export async function login(credentials: Credentials): Promise<LoginResponse> {
  if (USING_MOCK_API) return mockLogin(credentials)

  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  return data
}

export async function fetchCurrentUser(): Promise<User> {
  if (USING_MOCK_API) return mockMe()

  const { data } = await api.get<User>('/auth/me')
  return data
}

export async function logout(): Promise<void> {
  if (USING_MOCK_API) return

  /* Best effort: the local session is cleared regardless, so a failure to
     reach the server must not leave the user stuck on an admin screen. */
  try {
    await api.post('/auth/logout')
  } catch {
    /* Ignored by design. */
  }
}
