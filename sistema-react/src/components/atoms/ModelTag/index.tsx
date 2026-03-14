import clsx from 'clsx'
import styles from './ModelTag.module.css'

interface ModelTagProps {
  model: string
  className?: string
}

export function ModelTag({ model, className }: ModelTagProps) {
  return (
    <span className={clsx(styles.tag, className)}>
      {model}
    </span>
  )
}
