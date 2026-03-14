import { useMemo } from 'react'
import clsx from 'clsx'
import styles from './Sparkline.module.css'

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  data,
  color,
  width = 100,
  height = 30,
  className,
}: SparklineProps) {
  const gradientId = useMemo(() => `sparkGrad-${Math.random().toString(36).slice(2, 8)}`, [])

  const { polylinePoints, fillPoints } = useMemo(() => {
    if (!data.length) return { polylinePoints: '', fillPoints: '' }

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const step = 100 / (data.length - 1 || 1)

    const points = data.map((v, i) => {
      const x = i * step
      const y = 30 - ((v - min) / range) * 26 - 2
      return `${x},${y}`
    })

    const polyline = points.join(' ')
    const fill = `${points[0].split(',')[0]},30 ${polyline} ${points[points.length - 1].split(',')[0]},30`

    return { polylinePoints: polyline, fillPoints: fill }
  }, [data])

  const resolvedColor = color ?? 'var(--neon)'

  return (
    <svg
      className={clsx(styles.sparkline, className)}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      width={width}
      height={height}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={resolvedColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fillPoints && (
        <polygon
          className={styles.fill}
          points={fillPoints}
          fill={`url(#${gradientId})`}
        />
      )}
      {polylinePoints && (
        <polyline
          className={styles.line}
          points={polylinePoints}
          stroke={resolvedColor}
        />
      )}
    </svg>
  )
}
