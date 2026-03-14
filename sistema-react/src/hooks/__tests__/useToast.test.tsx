import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/stores/ToastContext.tsx'
import { useToast } from '../useToast'

function wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useToast())
    }).toThrow('useToast must be used inside ToastProvider')
  })

  it('success() adds a toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('Operation completed')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Operation completed')
    expect(result.current.toasts[0].type).toBe('success')
  })

  it('error() adds a toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.error('Something went wrong')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Something went wrong')
    expect(result.current.toasts[0].type).toBe('error')
  })
})
