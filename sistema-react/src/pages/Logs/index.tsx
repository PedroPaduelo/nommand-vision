import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import type { LogEntry } from '@/types/index.ts'
import { MetricCard } from '@/components/molecules/MetricCard/index.tsx'
import { Sparkline } from '@/components/organisms/Sparkline/index.tsx'
import { BarChart } from '@/components/organisms/BarChart/index.tsx'
import { generateLogEntry } from '@/services/logs.service.ts'
import { useAlerts } from '@/hooks/queries/useLogQueries.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './Logs.module.css'

type Level = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

const LEVELS: Level[] = ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG']
const MAX_LINES = 300
const DAY_KEYS = ['logs.days.mon', 'logs.days.tue', 'logs.days.wed', 'logs.days.thu', 'logs.days.fri', 'logs.days.sat', 'logs.days.sun']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildHeatmapData(): number[][] {
  return DAYS.map(() =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
  )
}

function buildErrorData(): number[] {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 40))
}

function heatmapColor(val: number): string {
  if (val < 15) return 'rgba(234,179,8,.08)'
  if (val < 35) return 'rgba(234,179,8,.2)'
  if (val < 55) return 'rgba(234,179,8,.35)'
  if (val < 75) return 'rgba(234,179,8,.55)'
  return 'rgba(234,179,8,.8)'
}

function highlightText(text: string, query: string) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className={styles.highlight}>{part}</mark>
      : part
  )
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [level, setLevel] = useState<Level>('ALL')
  const [search, setSearch] = useState('')
  const [live, setLive] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const streamRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef(true)
  const searchRef = useRef<HTMLInputElement>(null)

  const { t } = useTranslation()
  const { data: alerts = [] } = useAlerts()
  const [localAlerts, setLocalAlerts] = useState(alerts)
  useEffect(() => { if (alerts.length) setLocalAlerts(alerts) }, [alerts])

  const heatmap = useMemo(() => buildHeatmapData(), [])
  const errorData = useMemo(() => buildErrorData(), [])
  const errorLabels = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i}h`), [])
  const sparkLogs = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000) + 500), [])
  const sparkErrors = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 5), [])
  const sparkAlerts = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 5) + 1), [])
  const sparkMttr = useMemo(() => Array.from({ length: 12 }, () => Math.random() * 6 + 1), [])

  useEffect(() => {
    const initial: LogEntry[] = []
    for (let i = 0; i < 50; i++) initial.push(generateLogEntry())
    setLogs(initial)
  }, [])

  useEffect(() => {
    if (!live) return
    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, generateLogEntry()]
        return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next
      })
    }, 800 + Math.random() * 1500)
    return () => clearInterval(interval)
  }, [live])

  useEffect(() => {
    if (autoScrollRef.current && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [logs])

  const handleScroll = useCallback(() => {
    if (!streamRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = streamRef.current
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 40
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const filtered = useMemo(() => {
    let result = logs
    if (level !== 'ALL') result = result.filter(l => l.level === level)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.message.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q)
      )
    }
    return result
  }, [logs, level, search])

  const counts = useMemo(() => {
    const c = { ALL: logs.length, INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0 }
    for (const l of logs) c[l.level]++
    return c
  }, [logs])

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearLogs() {
    setLogs([])
    setExpandedIds(new Set())
  }

  function exportLogs() {
    const text = filtered.map(l =>
      `[${l.timestamp}] ${l.level.padEnd(5)} ${l.source.padEnd(12)} ${l.message}`
    ).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function ackAlert(id: number) {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, acked: true } : a))
  }

  function dismissAlert(id: number) {
    setLocalAlerts(prev => prev.filter(a => a.id !== id))
  }

  const activeAlertCount = localAlerts.filter(a => !a.acked && a.sev !== 'resolved').length

  return (
    <div className={styles.page}>
      <div className={styles.metricsRow}>
        <MetricCard label={t('logs.logs24h')} value="847K" sub={t('logs.vsYesterdayUp')}>
          <Sparkline data={sparkLogs} color="var(--neon)" />
        </MetricCard>
        <MetricCard label={t('logs.errors24h')} value="234" sub={t('logs.vsYesterdayDown')} trend="down">
          <Sparkline data={sparkErrors} color="var(--red)" />
        </MetricCard>
        <MetricCard label={t('logs.activeAlerts')} value={activeAlertCount} green>
          <Sparkline data={sparkAlerts} color="var(--green)" />
        </MetricCard>
        <MetricCard label={t('logs.mttr')} value="4.2min" sub={t('logs.avgResolutionTime')}>
          <Sparkline data={sparkMttr} color="var(--blue)" />
        </MetricCard>
      </div>

      <div className={styles.toolbar}>
        {LEVELS.map(l => (
          <button
            key={l}
            className={clsx(styles.filterBtn, level === l && styles.filterBtnActive)}
            onClick={() => setLevel(l)}
          >
            {l}
            <span className={styles.filterCount}>{counts[l]}</span>
          </button>
        ))}

        <button
          className={clsx(styles.liveToggle, live && styles.liveToggleLive)}
          onClick={() => setLive(!live)}
        >
          {live && <span className={styles.liveDot} />}
          {live ? t('logs.live') : t('logs.paused')}
        </button>

        <button className={styles.actionBtn} onClick={clearLogs}>{t('logs.clear')}</button>
        <button className={styles.actionBtn} onClick={exportLogs}>{t('logs.export')}</button>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>&#128269;</span>
          <input
            ref={searchRef}
            className={styles.searchInput}
            type="text"
            placeholder={t('logs.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <kbd className={styles.searchKbd}>/</kbd>
        </div>
      </div>

      <div className={styles.logsLayout}>
        <div className={styles.logsMain}>
          <div
            ref={streamRef}
            className={styles.logStream}
            onScroll={handleScroll}
          >
            {filtered.length === 0 && (
              <div className={styles.emptyStream}>{t('logs.noLogsFound')}</div>
            )}
            {filtered.map(log => {
              const expanded = expandedIds.has(log.id)
              return (
                <div key={log.id}>
                  <div className={styles.logLine} onClick={() => toggleExpand(log.id)}>
                    <span className={styles.logTimestamp}>{log.timestamp}</span>
                    <span className={clsx(styles.logLevel, styles[log.level.toLowerCase()])}>
                      {log.level}
                    </span>
                    <span className={styles.logSource}>{log.source}</span>
                    <span className={clsx(styles.logMessage, expanded && styles.logMessageExpanded)}>
                      {highlightText(log.message, search)}
                    </span>
                  </div>
                  {expanded && log.detail && (
                    <div className={styles.logDetail}>{log.detail}</div>
                  )}
                </div>
              )
            })}
          </div>

          <div className={styles.chartPanel}>
            <div className={styles.chartTitle}>{t('logs.heatmapTitle')}</div>
            <div className={styles.heatmapGrid}>
              <span />
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} style={{ textAlign: 'center', color: '#444', fontFamily: "'JetBrains Mono', monospace", fontSize: '.55rem' }}>
                  {i}
                </span>
              ))}
              {DAYS.map((day, di) => (
                <div key={day} className={styles.heatmapHourRow}>
                  <span className={styles.heatmapLabel}>{t(DAY_KEYS[di])}</span>
                  {heatmap[di].map((val, hi) => (
                    <div
                      key={hi}
                      className={styles.heatmapCell}
                      style={{ background: heatmapColor(val) }}
                      title={`${t(DAY_KEYS[di])} ${hi}h: ${val} req`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartPanel}>
            <div className={styles.chartTitle}>{t('logs.errorsPerHour')}</div>
            <BarChart data={errorData} labels={errorLabels} />
          </div>
        </div>

        <div className={styles.logsSidebar}>
          <div className={styles.alertsPanel}>
            <div className={styles.alertsTitle}>
              {t('logs.alerts')}
              {activeAlertCount > 0 && (
                <span className={styles.alertCount}>{activeAlertCount}</span>
              )}
            </div>
            {localAlerts.map(alert => (
              <div key={alert.id} className={styles.alertCard}>
                <div className={styles.alertCardHead}>
                  <span className={clsx(styles.alertSev, alert.sev === 'info' ? styles.sevInfo : styles[alert.sev])}>
                    {alert.sev}
                  </span>
                  <span className={styles.alertTitle}>{alert.title}</span>
                </div>
                <div className={styles.alertDesc}>{alert.desc}</div>
                <div className={styles.alertMeta}>{alert.meta}</div>
                {!alert.acked && alert.sev !== 'resolved' && (
                  <div className={styles.alertActions}>
                    <button className={styles.alertBtn} onClick={() => ackAlert(alert.id)}>
                      {t('logs.acknowledge')}
                    </button>
                    <button className={styles.alertBtn} onClick={() => dismissAlert(alert.id)}>
                      {t('logs.dismiss')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
