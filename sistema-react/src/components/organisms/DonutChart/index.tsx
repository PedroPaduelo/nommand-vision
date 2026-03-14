import { useMemo } from 'react'
import clsx from 'clsx'
import styles from './DonutChart.module.css'

interface DonutSegment {
  value: number
  color: string
  label: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  centerValue?: string
  className?: string
}

export function DonutChart({ segments, centerValue, className }: DonutChartProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1

  const arcs = useMemo(() => {
    let offset = 0
    return segments.map((seg) => {
      const pct = seg.value / total
      const dash = pct * circumference
      const currentOffset = circumference * 0.25 - offset
      offset += dash
      return {
        ...seg,
        dashArray: `${dash} ${circumference - dash}`,
        dashOffset: currentOffset,
      }
    })
  }, [segments, total, circumference])

  return (
    <div className={clsx(styles.wrapper, className)}>
      <svg viewBox="0 0 100 100" className={styles.svg}>
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth="8"
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            className={styles.segment}
          />
        ))}
      </svg>
      {centerValue && (
        <div className={styles.center}>{centerValue}</div>
      )}
      <div className={styles.legend}>
        {segments.map((seg, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: seg.color }} />
            <span className={styles.legendLabel}>{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
