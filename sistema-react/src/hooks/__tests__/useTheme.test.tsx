import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/stores/AuthContext.tsx'
import { ThemeProvider } from '@/stores/ThemeContext.tsx'
import { useTheme } from '../useTheme'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  )
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used inside ThemeProvider')
  })

  it('default theme is dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
  })

  it('setTheme toggles theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
  })
})
