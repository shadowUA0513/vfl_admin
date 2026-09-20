/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the VFL API. Leave unset to run against the local mock. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
