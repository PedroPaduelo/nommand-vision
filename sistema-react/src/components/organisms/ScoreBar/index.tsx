import clsx from 'clsx'
import styles from './ScoreBar.module.css'

interface ScoreBarProps {
  label: string
  score: number
  max?: number
  className?: string
}

export function ScoreBar({ label, score, max = 100, className }: ScoreBarProps) {
  const pct = Math.min(Math.max((score / max) * 100, 0), 100)

  let color: string
  if (pct > 80) {
    color = 'var(--green)'
  } else if (pct > 50) {
    color = 'var(--yellow)'
  } else {
    color = 'var(--red)'
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.labels}>
        <span className={styles.label}>{label}</span>
        <span className={styles.score}>{score}%</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
