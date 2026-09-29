/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the VFL API. Defaults to the proxied `/api` path. */
  readonly VITE_API_URL?: string
  /** Set to "true" to run against the local mock instead of the API. */
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
