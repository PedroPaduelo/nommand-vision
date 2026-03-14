import clsx from 'clsx'
import { useToast } from '@/hooks/useToast.ts'
import type { ToastType } from '@/types/index.ts'
import styles from './Toast.module.css'

const icons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
}

const iconStyles: Record<ToastType, string> = {
  success: styles.iconSuccess,
  error: styles.iconError,
  warning: styles.iconWarning,
  info: styles.iconInfo,
}

export function Toast() {
  const { toasts, remove } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(styles.toast, styles[t.type])}
          onClick={() => remove(t.id)}
        >
          <span className={clsx(styles.icon, iconStyles[t.type])}>{icons[t.type]}</span>
          <span className={styles.message}>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
