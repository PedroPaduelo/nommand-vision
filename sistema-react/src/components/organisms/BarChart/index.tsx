import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './BarChart.module.css'

interface BarChartProps {
  data: number[]
  labels?: string[]
  className?: string
}

export function BarChart({ data, labels, className }: BarChartProps) {
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const max = Math.max(...data, 1)

  useEffect(() => {
    const timeout = setTimeout(() => setAnimate(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className={clsx(styles.wrapper, className)} ref={ref}>
      <div className={styles.body}>
        {data.map((value, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{ height: animate ? `${(value / max) * 100}%` : '0%' }}
          />
        ))}
      </div>
      {labels && labels.length > 0 && (
        <div className={styles.labels}>
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
