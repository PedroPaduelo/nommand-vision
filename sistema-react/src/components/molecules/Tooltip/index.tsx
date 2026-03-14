import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Tooltip.module.css'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  return (
    <span className={clsx(styles.wrapper, className)}>
      {children}
      <span className={clsx(styles.tip, styles[position])}>{content}</span>
    </span>
  )
}
