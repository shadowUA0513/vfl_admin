/** Base URL of the VFL API. Empty when no backend is configured. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

/* True when no backend is configured. The session API reads this to fall
   back to the local mock, so the admin is runnable before the API exists. */
export const USING_MOCK_API = API_BASE_URL === ''
