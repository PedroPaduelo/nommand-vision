import { api, STORAGE_KEYS } from './api'

type AuthResponse = {
  data: {
    user: {
      id: string
      email: string
      name: string
      avatarUrl: string | null
      role: string | null
      stack: string[] | null
      cpuLevel: number | null
      onboarded: boolean
      theme: string
      tourDone: boolean
      plan: string
      authenticated: boolean
    }
    accessToken: string
    refreshToken: string
  }
}

type MeResponse = {
  data: {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    role: string | null
    stack: string[] | null
    cpuLevel: number | null
    onboarded: boolean
    theme: string
    tourDone: boolean
    plan: string
    authenticated: boolean
  }
}

export async function login(email: string, password: string) {
  const result = await api.post<AuthResponse>('/auth/login', { email, password })
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.data.accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.data.refreshToken)
  return result.data.user
}

export async function register(email: string, password: string, name: string) {
  const result = await api.post<AuthResponse>('/auth/register', { email, password, name })
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.data.accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.data.refreshToken)
  return result.data.user
}

export async function logout() {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  try {
    await api.post('/auth/logout', { refreshToken })
  } catch {}
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
}

export async function getMe() {
  const result = await api.get<MeResponse>('/auth/me')
  return result.data
}

export async function updateMe(data: Record<string, unknown>) {
  const result = await api.patch<MeResponse>('/auth/me', data)
  return result.data
}

export async function forgotPassword(email: string) {
  await api.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, password: string) {
  await api.post('/auth/reset-password', { token, password })
}
