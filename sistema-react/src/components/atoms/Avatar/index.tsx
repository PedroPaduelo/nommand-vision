import clsx from 'clsx'
import styles from './Avatar.module.css'

interface AvatarProps {
  initials: string
  color: string
  online?: boolean
  size?: number
  className?: string
}

export function Avatar({ initials, color, online, size = 32, className }: AvatarProps) {
  return (
    <div
      className={clsx(styles.avatar, className)}
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
      {online && <span className={styles.online} />}
    </div>
  )
}
