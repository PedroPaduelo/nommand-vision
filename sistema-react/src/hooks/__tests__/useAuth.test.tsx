import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/stores/AuthContext.tsx'
import { useAuth } from '../useAuth'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used inside AuthProvider')
  })

  it('initial state is not authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user.authenticated).toBe(false)
  })

  it('login sets authenticated to true', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.user.authenticated).toBe(true)
  })

  it('logout sets authenticated to false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.user.authenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.user.authenticated).toBe(false)
  })
})
