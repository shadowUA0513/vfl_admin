import type { User } from '@/entities/user/@x/session'

export interface Credentials {
  email: string
  password: string
}

/** Mirrors dto.LoginResponse. */
export interface LoginResponse {
  token: string
  expires_at?: string
  user: User
}
