import clsx from 'clsx'
import styles from './LiveIndicator.module.css'

interface LiveIndicatorProps {
  label?: string
  className?: string
}

export function LiveIndicator({ label = 'LIVE', className }: LiveIndicatorProps) {
  return (
    <span className={clsx(styles.wrapper, className)}>
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </span>
  )
}
