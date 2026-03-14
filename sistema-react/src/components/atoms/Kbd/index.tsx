import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Kbd.module.css'

interface KbdProps {
  children: ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={clsx(styles.kbd, className)}>
      {children}
    </kbd>
  )
}
