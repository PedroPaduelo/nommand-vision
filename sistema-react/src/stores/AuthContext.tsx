import { createContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Role, User } from '@/types/index.ts'
import { STORAGE_KEYS } from '@/utils/constants.ts'
import { STORAGE_KEYS as API_STORAGE_KEYS } from '@/services/api'
import * as authService from '@/services/auth.service'

interface AuthContextValue {
  user: User
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (partial: Partial<User>) => void
  completeOnboarding: (role: Role, stack: string[], cpuLevel: number) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialUser(): User {
  if (typeof window === 'undefined') {
    return {
      authenticated: false,
      userName: 'Alex',
      role: 'Frontend',
      stack: [],
      cpuLevel: 2,
      onboarded: false,
      theme: 'dark',
      tourDone: false,
    }
  }

  const ls = window.localStorage
  let stack: string[] = []
  try {
    const raw = ls.getItem(STORAGE_KEYS.STACK)
    if (raw) stack = JSON.parse(raw) as string[]
  } catch {
    // ignore
  }

  return {
    authenticated: ls.getItem(STORAGE_KEYS.AUTH) === 'true',
    userName: ls.getItem(STORAGE_KEYS.USER_NAME) || 'Alex',
    role: (ls.getItem(STORAGE_KEYS.ROLE) as Role) || 'Frontend',
    stack,
    cpuLevel: parseInt(ls.getItem(STORAGE_KEYS.CPU) || '2', 10) || 2,
    onboarded: ls.getItem(STORAGE_KEYS.ONBOARDED) === 'true',
    theme: (ls.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark',
    tourDone: ls.getItem(STORAGE_KEYS.TOUR_DONE) === 'true',
  }
}

function persistUser(user: User) {
  if (typeof window === 'undefined') return
  const ls = window.localStorage
  ls.setItem(STORAGE_KEYS.AUTH, user.authenticated ? 'true' : 'false')
  ls.setItem(STORAGE_KEYS.USER_NAME, user.userName)
  ls.setItem(STORAGE_KEYS.ROLE, user.role)
  ls.setItem(STORAGE_KEYS.STACK, JSON.stringify(user.stack))
  ls.setItem(STORAGE_KEYS.CPU, String(user.cpuLevel))
  ls.setItem(STORAGE_KEYS.ONBOARDED, user.onboarded ? 'true' : 'false')
  ls.setItem(STORAGE_KEYS.THEME, user.theme)
  ls.setItem(STORAGE_KEYS.TOUR_DONE, user.tourDone ? 'true' : 'false')
}

function mapApiUserToUser(apiUser: {
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
}): User {
  return {
    authenticated: true,
    userName: apiUser.name,
    role: (apiUser.role as Role) || 'Frontend',
    stack: apiUser.stack || [],
    cpuLevel: apiUser.cpuLevel || 2,
    onboarded: apiUser.onboarded,
    theme: apiUser.theme as 'dark' | 'light',
    tourDone: apiUser.tourDone,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(readInitialUser)

  useEffect(() => {
    persistUser(user)
  }, [user])

  useEffect(() => {
    const accessToken = localStorage.getItem(API_STORAGE_KEYS.ACCESS_TOKEN)
    if (accessToken) {
      authService.getMe()
        .then(apiUser => {
          setUser(mapApiUserToUser(apiUser))
        })
        .catch(() => {
          // Token inválido, mantém estado atual
        })
    }
  }, [])

  useEffect(() => {
    const handleForceLogout = () => {
      localStorage.removeItem(API_STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(API_STORAGE_KEYS.REFRESH_TOKEN)
      setUser(prev => ({ ...prev, authenticated: false }))
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const apiUser = await authService.login(email, password)
    const mapped = mapApiUserToUser(apiUser)
    setUser(mapped)
    return mapped
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {}
    setUser(prev => ({
      ...prev,
      authenticated: false,
    }))
  }, [])

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser(prev => ({ ...prev, ...partial }))
  }, [])

  const completeOnboarding = useCallback((role: Role, stack: string[], cpuLevel: number) => {
    setUser(prev => ({
      ...prev,
      role,
      stack,
      cpuLevel,
      onboarded: true,
    }))
  }, [])

  return (
    <AuthContext value={{
      user,
      login,
      logout,
      updateUser,
      completeOnboarding,
    }}>
      {children}
    </AuthContext>
  )
}
