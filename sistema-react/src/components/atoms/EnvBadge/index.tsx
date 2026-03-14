import clsx from 'clsx'
import styles from './EnvBadge.module.css'

interface EnvBadgeProps {
  env: 'prod' | 'staging' | 'preview'
  className?: string
}

export function EnvBadge({ env, className }: EnvBadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[env], className)}>
      {env}
    </span>
  )
}
