export interface User {
  id: string
  full_name: string
  email: string
  phone?: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}
