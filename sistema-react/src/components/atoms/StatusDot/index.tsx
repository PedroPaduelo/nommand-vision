import clsx from 'clsx'
import styles from './StatusDot.module.css'

interface StatusDotProps {
  status: 'running' | 'idle' | 'stopped' | 'error'
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={clsx(styles.dot, styles[status], className)}
    />
  )
}
