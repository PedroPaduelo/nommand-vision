import type { ToastItem } from '@/types/index.ts'

const typeColors: Record<string, string> = {
  success: 'var(--green)',
  error: 'var(--red)',
  warning: 'var(--yellow)',
  info: 'var(--blue)',
}

interface ToastProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${typeColors[toast.type] || 'var(--muted)'}`,
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: '.82rem',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,.5)',
            animation: 'slideUp .3s ease forwards',
            minWidth: 240,
            maxWidth: 360,
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
