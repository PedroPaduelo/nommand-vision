import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './MetricCard.module.css'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down'
  green?: boolean
  children?: ReactNode
  className?: string
}

export function MetricCard({ label, value, sub, trend, green, children, className }: MetricCardProps) {
  const valueClass = [
    styles.value,
    green ? styles.green : '',
    trend === 'up' ? styles.trendUp : '',
    trend === 'down' ? styles.trendDown : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={clsx(styles.card, className)}>
      <span className={styles.label}>{label}</span>
      <span className={valueClass}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
      {children && <div className={styles.sparkline}>{children}</div>}
    </div>
  )
}
