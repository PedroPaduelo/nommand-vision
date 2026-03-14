import { useMemo } from 'react'
import clsx from 'clsx'
import styles from './LineChart.module.css'

interface LineChartProps {
  data1: number[]
  data2?: number[]
  labels?: string[]
  label1?: string
  label2?: string
  className?: string
}

export function LineChart({
  data1,
  data2,
  labels,
  label1 = 'P50',
  label2 = 'P99',
  className,
}: LineChartProps) {
  const grad1Id = useMemo(() => `lineGrad1-${Math.random().toString(36).slice(2, 8)}`, [])
  const grad2Id = useMemo(() => `lineGrad2-${Math.random().toString(36).slice(2, 8)}`, [])

  const allValues = [...data1, ...(data2 ?? [])]
  const max = Math.max(...allValues, 1)
  const min = Math.min(...allValues, 0)
  const range = max - min || 1

  const viewW = 200
  const viewH = 80
  const padY = 4

  function toPoints(data: number[]) {
    const step = viewW / (data.length - 1 || 1)
    return data.map((v, i) => {
      const x = i * step
      const y = viewH - padY - ((v - min) / range) * (viewH - padY * 2)
      return { x, y }
    })
  }

  function polyline(pts: { x: number; y: number }[]) {
    return pts.map(p => `${p.x},${p.y}`).join(' ')
  }

  function fillPolygon(pts: { x: number; y: number }[]) {
    if (!pts.length) return ''
    return `${pts[0].x},${viewH} ${polyline(pts)} ${pts[pts.length - 1].x},${viewH}`
  }

  const pts1 = toPoints(data1)
  const pts2 = data2 ? toPoints(data2) : null

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.legendRow}>
        <span className={styles.legendItem}>
          <span className={styles.legendLine} style={{ background: 'var(--green)' }} />
          {label1}
        </span>
        {data2 && (
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: 'var(--yellow)' }} />
            {label2}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className={styles.svg} preserveAspectRatio="none">
        <defs>
          <linearGradient id={grad1Id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={grad2Id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--yellow)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--yellow)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPolygon(pts1)} fill={`url(#${grad1Id})`} />
        <polyline
          points={polyline(pts1)}
          fill="none"
          stroke="var(--green)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts2 && (
          <>
            <polygon points={fillPolygon(pts2)} fill={`url(#${grad2Id})`} />
            <polyline
              points={polyline(pts2)}
              fill="none"
              stroke="var(--yellow)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
      {labels && labels.length > 0 && (
        <div className={styles.labels}>
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}
