import clsx from 'clsx'
import styles from './Tag.module.css'

interface TagProps {
  label: string
  className?: string
}

export function Tag({ label, className }: TagProps) {
  return (
    <span className={clsx(styles.tag, className)}>
      {label}
    </span>
  )
}
