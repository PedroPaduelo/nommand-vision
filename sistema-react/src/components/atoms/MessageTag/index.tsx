import clsx from 'clsx'
import styles from './MessageTag.module.css'

interface MessageTagProps {
  tag: 'deploy' | 'mention' | 'ai' | 'alert' | 'review'
  label: string
  className?: string
}

export function MessageTag({ tag, label, className }: MessageTagProps) {
  return (
    <span className={clsx(styles.tag, styles[tag], className)}>
      {label}
    </span>
  )
}
