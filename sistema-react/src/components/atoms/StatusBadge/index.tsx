import clsx from 'clsx'
import styles from './StatusBadge.module.css'

const defaultLabels: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  success: 'Success',
  fail: 'Fail',
  building: 'Building',
}

interface StatusBadgeProps {
  status: 'active' | 'draft' | 'success' | 'fail' | 'building'
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(styles.badge, styles[status], className)}
    >
      {label ?? defaultLabels[status]}
    </span>
  )
}
