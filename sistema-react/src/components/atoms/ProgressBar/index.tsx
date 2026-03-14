import clsx from 'clsx'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  variant?: 'default' | 'warn' | 'critical'
  className?: string
}

export function ProgressBar({ value, variant = 'default', className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={clsx(styles.track, className)}>
      <div
        className={clsx(styles.fill, styles[variant])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
