import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '@/shared/config/env'
import { clearToken, readToken } from '@/shared/lib/auth-token'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

/* The 401 handler is a registered callback rather than a direct import of
   the session store: `shared` sits below `entities`, so importing the store
   here would invert the layer order. The store registers itself on load. */
type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler = () => {}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    /* A 401 means the token is gone or expired. Drop it immediately so no
       further request goes out with a dead credential, then let the store
       flip the app back to the login screen. */
    if (error.response?.status === 401) {
      clearToken()
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

/* Axios errors carry the useful message in different places depending on
   whether the server answered, so normalise it once here for the UI. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.code === 'ECONNABORTED') return 'The request timed out.'
    if (!error.response) return 'Cannot reach the server.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
