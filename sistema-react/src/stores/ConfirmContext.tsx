import { createContext, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

interface ConfirmState {
  open: boolean
  title: string
  message: string
  danger: boolean
}

interface ConfirmContextValue {
  confirm: (title: string, message: string, danger?: boolean) => Promise<boolean>
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    danger: false,
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((title: string, message: string, danger = false): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({ open: true, title, message, danger })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setState(prev => ({ ...prev, open: false }))
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const handleCancel = useCallback(() => {
    setState(prev => ({ ...prev, open: false }))
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  return (
    <ConfirmContext value={{ confirm }}>
      {children}
      {state.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              background: 'var(--panel, #0a0a0a)',
              border: '1px solid var(--border, #1a1a1a)',
              borderRadius: 12,
              padding: '2rem',
              maxWidth: 400,
              width: '90%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.05rem', marginBottom: '.5rem' }}>
              {state.title}
            </h3>
            <p style={{
              fontSize: '.85rem',
              color: 'var(--muted, #777)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}>
              {state.message}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border, #1a1a1a)',
                  color: 'var(--muted, #777)',
                  padding: '8px 16px',
                  fontSize: '.82rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  background: state.danger ? 'rgba(239,68,68,.15)' : 'rgba(99,102,241,.15)',
                  border: `1px solid ${state.danger ? 'rgba(239,68,68,.25)' : 'rgba(99,102,241,.25)'}`,
                  color: state.danger ? '#ef4444' : '#6366f1',
                  padding: '8px 16px',
                  fontSize: '.82rem',
                  fontWeight: 600,
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext>
  )
}
