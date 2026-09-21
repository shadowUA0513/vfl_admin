import { readToken } from '@/shared/lib/auth-token'
import type { Role, User } from '@/entities/user/@x/session'
import type { Credentials, LoginResponse } from '../model/types'

/* ------------------------------------------------------------------ */
/* DEV MOCK — delete this file once the real API is up.               */
/* Active only while VITE_API_URL is unset (see USING_MOCK_API).      */
/*                                                                    */
/* The password is not checked: any input signs you in, so screens    */
/* can be built without a backend. Scoped to this file on purpose —   */
/* setting VITE_API_URL routes login through the real endpoint and    */
/* none of this runs.                                                 */
/* ------------------------------------------------------------------ */

const ACCOUNTS: Array<{ user: User }> = [
  { user: { id: 'u_1', email: 'admin@vfl.com', name: 'Umarjon', role: 'super_admin' } },
  { user: { id: 'u_2', email: 'editor@vfl.com', name: 'Match Editor', role: 'editor' } },
]

/* Anything that isn't one of the named accounts lands here, so an unknown
   email still gets you in — with full access. */
const DEFAULT_ACCOUNT = ACCOUNTS[0]

/* The token encodes the user id so a page refresh can restore the right
   session, the way a real JWT's subject claim would. */
const TOKEN_PREFIX = 'mock.'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function unauthorized(): never {
  /* Shaped like an axios error so apiErrorMessage reads it the same way it
     will read the real server's 401. */
  throw Object.assign(new Error('Session expired.'), {
    isAxiosError: true,
    response: { status: 401, data: { message: 'Session expired.' } },
  })
}

export async function mockLogin({ email }: Credentials): Promise<LoginResponse> {
  /* Short enough to feel instant, long enough that the button's loading
     state is visible rather than flickering. */
  await delay(280)

  /* Matching a known email still resolves to that role, which is what keeps
     the role guards testable — sign in as viewer@vfl.com and /events still
     redirects to /forbidden. Everything else is a superadmin. */
  const match = ACCOUNTS.find(
    (account) => account.user.email.toLowerCase() === email.trim().toLowerCase(),
  )
  const account = match ?? DEFAULT_ACCOUNT

  /* Mirrors the real API so automatic expiry behaves the same in mock mode.
     Shorten this to test the sign-out path without waiting a day. */
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  return { token: `${TOKEN_PREFIX}${account.user.id}`, user: account.user, expires_at: expiresAt }
}

export async function mockMe(): Promise<User> {
  await delay(200)

  /* A stored token still has to resolve to a real account, so clearing
     localStorage genuinely signs you out instead of silently restoring. */
  const token = readToken()
  const id = token?.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null
  const match = ACCOUNTS.find((account) => account.user.id === id)
  if (!match) unauthorized()

  return match.user
}

/** Named accounts shown on the login screen while the mock is active. */
export const MOCK_HINTS: Array<{ email: string; role: Role }> = ACCOUNTS.map((account) => ({
  email: account.user.email,
  role: account.user.role,
}))
