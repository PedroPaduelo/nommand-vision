import { createContext, useState, useCallback, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { ToastItem, ToastType } from '@/types/index.ts'

interface ToastContextValue {
  toasts: ToastItem[]
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
  remove: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  const remove = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast_${++counterRef.current}_${Date.now()}`
    const toast: ToastItem = { id, message, type }
    setToasts(prev => [...prev, toast])

    const timeout = setTimeout(() => {
      remove(id)
    }, 3500)
    timeoutsRef.current.set(id, timeout)
  }, [remove])

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast])
  const warning = useCallback((msg: string) => addToast(msg, 'warning'), [addToast])
  const info = useCallback((msg: string) => addToast(msg, 'info'), [addToast])

  return (
    <ToastContext value={{ toasts, success, error, warning, info, remove }}>
      {children}
    </ToastContext>
  )
}
