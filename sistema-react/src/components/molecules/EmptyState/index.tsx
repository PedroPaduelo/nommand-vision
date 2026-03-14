import clsx from 'clsx'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  )
}
