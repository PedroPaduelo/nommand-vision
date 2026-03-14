import { useState, useEffect, useRef, useCallback } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import {
  useMetrics,
  useEndpoints,
  useGeoData,
  usePeriodData,
} from '@/hooks/queries/useAnalyticsQueries.ts'
import { MetricCard } from '@/components/molecules/MetricCard/index.tsx'
import { Sparkline } from '@/components/organisms/Sparkline/index.tsx'
import { BarChart } from '@/components/organisms/BarChart/index.tsx'
import { DonutChart } from '@/components/organisms/DonutChart/index.tsx'
import { LineChart } from '@/components/organisms/LineChart/index.tsx'
import { DataTable } from '@/components/organisms/DataTable/index.tsx'
import { LiveIndicator } from '@/components/atoms/LiveIndicator/index.tsx'
import styles from './Analytics.module.css'

type Period = '7d' | '30d' | '90d'

export default function Analytics() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('30d')
  const [refreshing, setRefreshing] = useState(false)
  const [liveLatency, setLiveLatency] = useState<string | null>(null)

  const latencyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: metrics, refetch: refetchMetrics } = useMetrics(period)
  const { data: endpoints = [] } = useEndpoints()
  const { data: geo = [] } = useGeoData()
  const { data: periodData, refetch: refetchPeriod } = usePeriodData(period)

  // Format endpoint data for DataTable
  const tableData = endpoints.map(ep => ({
    endpoint: ep.endpoint,
    requests: ep.requests,
    latency: `${ep.latency}ms`,
    error: `${(ep.error * 100).toFixed(2)}%`,
    p99: `${ep.p99}ms`,
    status: ep.status === 'success' ? 'success' : ep.status === 'warning' ? 'warning' : 'error',
  }))

  // Donut chart segments
  const donutSegments = [
    { value: 75, color: '#22c55e', label: `${t('analytics.success')} (75%)` },
    { value: 15, color: '#eab308', label: `${t('analytics.warning')} (15%)` },
    { value: 10, color: '#ef4444', label: `${t('analytics.error')} (10%)` },
  ]

  // Line chart data: P50 = latency, P99 = latency * ~2.5
  const latencyP50 = periodData?.latency ?? []
  const latencyP99 = latencyP50.map(v => Math.round(v * (2.5 + Math.random() * 0.5)))

  // Sparkline data for metric cards
  const requestSparkline = periodData?.requests?.slice(-14) ?? []
  const latencySparkline = periodData?.latency?.slice(-14) ?? []
  const errorSparkline = (periodData?.errors ?? []).slice(-14).map(v => v * 100)

  // Sampled labels for bar chart (max 30 bars displayed)
  const barData = periodData?.requests ?? []
  const barLabels = periodData?.labels ?? []
  const step = Math.max(1, Math.ceil(barData.length / 30))
  const sampledBarData = barData.filter((_, i) => i % step === 0).slice(0, 30)
  const sampledBarLabels = barLabels.filter((_, i) => i % step === 0).slice(0, 30)

  // Sampled line labels
  const lineLabelsRaw = periodData?.labels ?? []
  const lineStep = Math.max(1, Math.ceil(lineLabelsRaw.length / 7))
  const lineLabels = lineLabelsRaw.filter((_, i) => i % lineStep === 0).slice(0, 7)

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([refetchMetrics(), refetchPeriod()]).finally(() => {
      setTimeout(() => setRefreshing(false), 600)
    })
  }, [refetchMetrics, refetchPeriod])

  // Real-time latency update every 5s
  useEffect(() => {
    latencyIntervalRef.current = setInterval(() => {
      setLiveLatency(prev => {
        const current = parseInt(prev ?? metrics?.avgLatency ?? '24', 10) || 24
        const next = Math.max(18, Math.min(35, current + Math.floor(Math.random() * 5) - 2))
        return `${next}ms`
      })
    }, 5000)

    return () => {
      if (latencyIntervalRef.current) clearInterval(latencyIntervalRef.current)
    }
  }, [metrics?.avgLatency])

  // Reset live latency when period changes
  useEffect(() => {
    setLiveLatency(null)
  }, [period])

  const displayLatency = liveLatency ?? metrics?.avgLatency ?? '24ms'

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>{t('analytics.title')}</h1>
          <p>{t('analytics.subtitle')}</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.periodSelect}>
            {(['7d', '30d', '90d'] as Period[]).map(p => (
              <button
                key={p}
                className={clsx(styles.periodBtn, period === p && styles.periodBtnActive)}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className={clsx(styles.refreshBtn, refreshing && styles.refreshSpinning)}
            onClick={handleRefresh}
            title={t('analytics.refreshData')}
          >
            <svg
              className={styles.refreshIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard label={t('analytics.requests')} value={metrics?.totalRequests ?? '...'} sub="+12.5%" trend="up">
          <Sparkline data={requestSparkline} color="var(--neon)" />
        </MetricCard>
        <MetricCard label={t('analytics.uptime')} value={metrics?.uptime ?? '...'} sub="+8.2%" trend="up" green>
          <Sparkline data={[99.9, 100, 99.95, 100, 99.97, 100, 99.99]} color="var(--green)" />
        </MetricCard>
        <MetricCard label={t('analytics.avgLatency')} value={displayLatency} sub="+15.3%" trend="up">
          <Sparkline data={latencySparkline} color="#06b6d4" />
        </MetricCard>
        <MetricCard label={t('analytics.errorRate')} value={metrics?.errorRate ?? '...'} sub="+23.1%" trend="up" green>
          <Sparkline data={errorSparkline} color="var(--red)" />
        </MetricCard>
      </div>

      {/* Bar chart + Donut */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('analytics.requestsPerDay')}</h3>
            <LiveIndicator label={t('analytics.live')} />
          </div>
          <div className={clsx(styles.chartBody, styles.chartBodyTall)}>
            <BarChart data={sampledBarData} labels={sampledBarLabels} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('analytics.requestStatus')}</h3>
          </div>
          <div className={clsx(styles.chartBody, styles.chartBodyTall)}>
            <DonutChart
              segments={donutSegments}
              centerValue={metrics?.totalRequests ?? '...'}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>{t('analytics.topEndpoints')}</h3>
        </div>
        <DataTable columns={[
          { key: 'endpoint', label: t('analytics.colEndpoint'), sortable: true },
          { key: 'requests', label: t('analytics.colRequests'), sortable: true },
          { key: 'latency', label: t('analytics.colAvgLatency'), sortable: true },
          { key: 'error', label: t('analytics.colErrorRate'), sortable: true },
          { key: 'p99', label: t('analytics.colP99'), sortable: true },
          { key: 'status', label: t('analytics.colStatus'), sortable: false },
        ]} data={tableData} searchable />
      </div>

      {/* Line chart + Geo */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('analytics.latencyOverTime')}</h3>
            <div style={{ display: 'flex', gap: 16, fontSize: '.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                P50
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} />
                P99
              </span>
            </div>
          </div>
          <div className={clsx(styles.chartBody, styles.chartBodyTall)}>
            <LineChart
              data1={latencyP50}
              data2={latencyP99}
              labels={lineLabels}
              label1="P50"
              label2="P99"
            />
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>{t('analytics.topRegions')}</h3>
          </div>
          <div className={styles.chartBody}>
            <div className={styles.geoList}>
              {geo.map(item => (
                <div key={item.name} className={styles.geoItem}>
                  <span className={styles.geoFlag}>{item.flag}</span>
                  <div className={styles.geoInfo}>
                    <div className={styles.geoRow}>
                      <span className={styles.geoName}>{item.name}</span>
                      <span className={styles.geoPercent}>{item.value}%</span>
                    </div>
                    <div className={styles.geoBarTrack}>
                      <div className={styles.geoBarFill} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
