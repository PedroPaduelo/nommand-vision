import { useContext } from 'react'
import { ToastContext } from '@/stores/ToastContext.tsx'

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
