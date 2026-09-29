/**
 * Where the API lives.
 *
 * A same-origin path rather than the backend's own host: Vite proxies /api
 * in development (vite.config.ts) and Netlify proxies it in production
 * (public/_redirects). Keeping every request on the page's own origin is
 * what makes an HTTP-only backend usable from an HTTPS site at all — the
 * browser blocks a direct HTTPS-page-to-HTTP-API call as mixed content.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

/**
 * Whether to run against the local localStorage mock instead of the API.
 *
 * Opted into, never fallen into. This used to switch on whenever
 * VITE_API_URL was unset — which is exactly the state of any deploy host
 * that was never given the variable, so the built site quietly served
 * seeded fake data and made no network requests at all.
 */
export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK === 'true'
