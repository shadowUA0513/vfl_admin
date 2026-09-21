const TOKEN_KEY = 'vfl.admin.token'
const EXPIRY_KEY = 'vfl.admin.token.expires'

/* Kept in its own module so the axios interceptor and the session store can
   both reach the token without importing each other — the interceptor needs
   it on every request, and the store owns the session lifecycle. */

/* The API's JWT has no refresh endpoint, so the expiry it reports at login
   is the whole story. Treating the token as dead slightly early avoids
   firing a request that is certain to come back 401 because the clocks
   disagree by a second or two. */
const EXPIRY_SKEW_MS = 5_000

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    /* Private mode or blocked site data — treat as logged out rather than
       crashing the app shell. */
    return null
  }
}

/** Expiry as epoch milliseconds, or null when unknown. */
export function readExpiresAt(): number | null {
  try {
    const raw = localStorage.getItem(EXPIRY_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeToken(token: string, expiresAt?: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)

    const parsed = expiresAt ? Date.parse(expiresAt) : Number.NaN
    if (Number.isFinite(parsed)) {
      localStorage.setItem(EXPIRY_KEY, String(parsed))
    } else {
      /* An unparseable or absent expiry must not leave a stale one behind
         from the previous session. */
      localStorage.removeItem(EXPIRY_KEY)
    }
  } catch {
    /* Session degrades to this tab only. */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  } catch {
    /* Nothing to clear. */
  }
}

/** Milliseconds until expiry. `null` when there is no known expiry. */
export function msUntilExpiry(): number | null {
  const expiresAt = readExpiresAt()
  if (expiresAt === null) return null
  return expiresAt - EXPIRY_SKEW_MS - Date.now()
}

/**
 * True only when an expiry is known and has passed. An unknown expiry is
 * reported as not-expired: the 401 interceptor is the backstop, and
 * guessing would sign people out of perfectly good sessions.
 */
export function isSessionExpired(): boolean {
  const remaining = msUntilExpiry()
  return remaining !== null && remaining <= 0
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY
export const EXPIRY_STORAGE_KEY = EXPIRY_KEY
