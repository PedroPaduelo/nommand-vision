import { createContext, useState, useCallback, useEffect, useContext } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext.tsx'
import { ROLE_THEMES, STORAGE_KEYS } from '@/utils/constants.ts'

interface ThemeContextValue {
  theme: 'dark' | 'light'
  accent: string
  roleName: string
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext)
  const role = auth?.user.role ?? 'Frontend'

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (window.localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark'
  })

  const roleTheme = ROLE_THEMES[role] ?? ROLE_THEMES.Frontend
  const accent = roleTheme.hex
  const roleName = roleTheme.name

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.setProperty('--neon', accent)
  }, [theme, accent])

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.THEME, t)
    }
    if (auth) {
      auth.updateUser({ theme: t })
    }
  }, [auth])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeContext value={{
      theme,
      accent,
      roleName,
      setTheme,
      toggleTheme,
    }}>
      {children}
    </ThemeContext>
  )
}
