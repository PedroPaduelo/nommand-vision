import clsx from 'clsx'
import styles from './ActivityTimeline.module.css'

interface ActivityItem {
  color: string
  text: string
  time: string
}

interface ActivityTimelineProps {
  items: ActivityItem[]
  className?: string
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  return (
    <ul className={clsx(styles.activity, className)}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.dot} style={{ background: `var(--${item.color})` }} />
          <span className={styles.text}>{item.text}</span>
          <span className={styles.time}>{item.time}</span>
        </li>
      ))}
    </ul>
  )
}
