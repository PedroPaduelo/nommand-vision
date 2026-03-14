import clsx from 'clsx'
import styles from './UptimeBar.module.css'

export interface UptimeBarData {
  height: number
  isDown: boolean
}

interface UptimeBarProps {
  data: UptimeBarData[]
  className?: string
}

export function UptimeBar({ data, className }: UptimeBarProps) {
  return (
    <div className={clsx(styles.uptimeBar, className)}>
      {data.map((bar, i) => (
        <div
          key={i}
          className={clsx(styles.bar, bar.isDown ? styles.down : styles.up)}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  )
}
