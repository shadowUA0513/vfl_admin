import { api } from '@/shared/api'
import { USING_MOCK_API } from '@/shared/config/env'
import type { User } from '@/entities/user/@x/session'
import type { Credentials, LoginResponse } from '../model/types'
import { mockLogin, mockMe } from './mockSessionApi'

/* Real contract, confirmed against the API's Swagger document:
     POST /auth/login  { email, password } -> { token, expires_at, user }
     GET  /admin/me                        -> AdminUserDTO
   There is no logout endpoint — see `logout` below. */

export async function login(credentials: Credentials): Promise<LoginResponse> {
  if (USING_MOCK_API) return mockLogin(credentials)

  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  return data
}

export async function fetchCurrentUser(): Promise<User> {
  if (USING_MOCK_API) return mockMe()

  const { data } = await api.get<User>('/admin/me')
  return data
}

/**
 * The API issues a bearer token with an `expires_at` and exposes no
 * revocation endpoint, so signing out is purely local: drop the token and
 * clear the cache. The token stays technically valid until it expires,
 * which is worth knowing if one ever leaks.
 */
export async function logout(): Promise<void> {
  /* Intentionally empty. Kept as a function so callers don't have to change
     if a revocation endpoint is added later. */
}
