const TOKEN_KEY = 'vfl.admin.token'

/* Lives in `shared` rather than with the session entity because the HTTP
   client needs the token on every request, and `shared` cannot import from
   a layer above it. */

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    /* Private mode or blocked site data — treat as logged out rather than
       crashing the app shell. */
    return null
  }
}

export function writeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* Session degrades to this tab only. */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* Nothing to clear. */
  }
}

export const TOKEN_STORAGE_KEY = TOKEN_KEY
