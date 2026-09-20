import type { User } from '@/entities/user/@x/session'

export interface Credentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}
