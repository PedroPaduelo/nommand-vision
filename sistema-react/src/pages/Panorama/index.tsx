import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useMetrics } from '@/hooks/queries/useAnalyticsQueries.ts'
import css from './Panorama.module.css'

interface SparklineProps {
  id: string
  data: number[]
}

function Sparkline({ id, data }: SparklineProps) {
  const w = 100
  const h = 30
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const fillPoints = `0,${h} ${points} ${w},${h}`
  const gradId = `sparkGrad-${id}`

  return (
    <svg className={css.sparkline} viewBox="0 0 100 30">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--neon)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={fillPoints} fill={`url(#${gradId})`} stroke="none" opacity="0.15" />
      <polyline points={points} />
    </svg>
  )
}

function UptimeBar() {
  const bars = useMemo(() => {
    return Array.from({ length: 30 }, () => {
      const ok = Math.random() > 0.03
      const h = ok ? 10 + Math.random() * 4 : 6
      const color = ok ? 'var(--green)' : 'var(--red)'
      return { height: h, color }
    })
  }, [])

  return (
    <div className={css.uptimeBar}>
      {bars.map((bar, i) => (
        <div
          key={i}
          className={css.ub}
          style={{ height: `${bar.height}px`, background: bar.color }}
        />
      ))}
    </div>
  )
}

interface TourStep {
  titleKey: string
  descKey: string
}

const TOUR_STEPS: TourStep[] = [
  { titleKey: 'tour.navigation.title', descKey: 'tour.navigation.desc' },
  { titleKey: 'tour.search.title', descKey: 'tour.search.desc' },
  { titleKey: 'tour.notifications.title', descKey: 'tour.notifications.desc' },
  { titleKey: 'tour.panorama.title', descKey: 'tour.panorama.desc' },
]

function Tour({ onFinish }: { onFinish: () => void }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const current = TOUR_STEPS[step]

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onFinish()
    }
  }, [step, onFinish])

  return (
    <div className={css.tourOverlay}>
      <div className={css.tourCard}>
        <h3>{t(current.titleKey)}</h3>
        <p>{t(current.descKey)}</p>
        <div className={css.tourActions}>
          <button className={css.tourSkipBtn} onClick={onFinish}>
            {t('tour.skip')}
          </button>
          <button className={css.tourNextBtn} onClick={handleNext}>
            {step < TOUR_STEPS.length - 1 ? t('tour.next') : t('tour.finish')}
          </button>
        </div>
        <div className={css.tourDots}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={clsx(css.tourDot, i === step && css.tourDotActive)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const ACTIVITIES: { dotClass: string; textKey: string; time: string }[] = [
  { dotClass: 'actDotGreen', textKey: 'panorama.activity.deploy47', time: 'agora' },
  { dotClass: 'actDotBlue', textKey: 'panorama.activity.pipeline', time: '2 min' },
  { dotClass: 'actDotYellow', textKey: 'panorama.activity.cpuAlert', time: '5 min' },
  { dotClass: 'actDotGreen', textKey: 'panorama.activity.provisioned', time: '8 min' },
  { dotClass: 'actDotBlue', textKey: 'panorama.activity.merge', time: '12 min' },
  { dotClass: 'actDotGreen', textKey: 'panorama.activity.tests', time: '15 min' },
]

const DEPLOYS: { num: string; env: string; detail: string; status: 'success' | 'fail'; time: string }[] = [
  { num: '#47', env: 'Production', detail: 'main \u2192 v2.4.1 \u00b7 1.2s', status: 'success', time: 'agora' },
  { num: '#46', env: 'Staging', detail: 'feat/auth \u2192 v2.4.0 \u00b7 3.4s', status: 'success', time: '1h' },
  { num: '#45', env: 'Production', detail: 'hotfix/css \u2192 failed', status: 'fail', time: '3h' },
  { num: '#44', env: 'Preview', detail: 'feat/dashboard \u2192 v2.3.9 \u00b7 2.1s', status: 'success', time: '5h' },
]

export default function Panorama() {
  const { user, updateUser } = useAuth()
  const { t } = useTranslation()
  const { data: metrics, isLoading: metricsLoading } = useMetrics('30d')

  const [latency, setLatency] = useState('11ms')
  const [showTour, setShowTour] = useState(!user.tourDone)
  const cpuBarRef = useRef<HTMLDivElement>(null)

  const reqData = useMemo(() => Array.from({ length: 20 }, () => Math.random() * 40 + 80), [])
  const [latData, setLatData] = useState(() => Array.from({ length: 20 }, () => Math.random() * 6 + 8))

  const cpu = user.cpuLevel
  const stack = user.stack

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cpuBarRef.current) {
        cpuBarRef.current.style.width = `${cpu * 20}%`
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [cpu])

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(`${Math.floor(Math.random() * 5) + 9}ms`)
      setLatData(Array.from({ length: 20 }, () => Math.random() * 6 + 8))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  function getGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return t('greeting.morning')
    if (h < 18) return t('greeting.afternoon')
    return t('greeting.evening')
  }

  const handleTourFinish = useCallback(() => {
    setShowTour(false)
    updateUser({ tourDone: true })
  }, [updateUser])

  return (
    <>
      {showTour && <Tour onFinish={handleTourFinish} />}

      <div className={css.welcomeBanner}>
        <h2>{t('panorama.welcome', { greeting: getGreeting(), name: user.userName })}</h2>
        <p>{t('panorama.workspaceOk')}</p>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div className={css.row4}>
        <div className={clsx(css.dCard, css.metricCard)}>
          <span className={css.dLabel}>{t('panorama.status')}</span>
          <span className={clsx(css.dBig, css.dBigGreen)}>{t('panorama.operational')}</span>
          <span className={css.dSub}>{t('panorama.allActive')}</span>
        </div>

        <div className={clsx(css.dCard, css.metricCard)}>
          <span className={css.dLabel}>{t('panorama.requests24h')}</span>
          <span className={css.dBig}>{metricsLoading ? '...' : metrics?.totalRequests ?? '124.5K'}</span>
          <span className={clsx(css.dSub, css.trendUp)}>{t('panorama.vsYesterday')}</span>
          {/* Sparkline uses demo data for visual effect */}
          <Sparkline id="spark-req" data={reqData} />
        </div>

        <div className={clsx(css.dCard, css.metricCard)}>
          <span className={css.dLabel}>{t('panorama.avgLatency')}</span>
          <span className={css.dBig}>{metricsLoading ? '...' : metrics?.avgLatency ?? latency}</span>
          <span className={clsx(css.dSub, css.trendUp)}>{t('panorama.belowSla')}</span>
          {/* Sparkline uses demo data for visual effect */}
          <Sparkline id="spark-lat" data={latData} />
        </div>

        <div className={clsx(css.dCard, css.metricCard)}>
          <span className={css.dLabel}>{t('panorama.uptime')}</span>
          <span className={clsx(css.dBig, css.dBigGreen)}>{metricsLoading ? '...' : metrics?.uptime ?? '99.98%'}</span>
          <span className={css.dSub}>{t('panorama.last30days')}</span>
          {/* UptimeBar uses demo data for visual effect */}
          <UptimeBar />
        </div>
      </div>

      {/* Row 2: Stack + Compute */}
      <div className={css.row2}>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('panorama.activeStack')}</span>
          <div className={css.tags}>
            {stack.length > 0
              ? stack.map(s => <span key={s} className={css.dtag}>{s}</span>)
              : <span className={css.dtag}>{t('panorama.baseline')}</span>
            }
          </div>
        </div>

        <div className={css.dCard}>
          <span className={css.dLabel}>{t('panorama.computePower')}</span>
          <span className={css.dBig}>{cpu * 2} vCPUs</span>
          <div className={css.miniBarWrap}>
            <div className={css.miniBar} ref={cpuBarRef} style={{ width: '0%' }} />
          </div>
          <div className={css.resourceRow}>
            <span className={css.dSub}>RAM: <strong>{cpu * 4} GB</strong></span>
            <span className={css.dSub}>Storage: <strong>50 GB SSD</strong></span>
          </div>
        </div>
      </div>

      {/* Row 3: Activity + Deploys + Terminal */}
      <div className={css.row3}>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('panorama.recentActivity')}</span>
          <ul className={css.activity}>
            {ACTIVITIES.map((act, i) => (
              <li key={i}>
                <span className={clsx(css.actDot, css[act.dotClass as keyof typeof css])} />
                <span>{t(act.textKey)}</span>
                <span className={css.actTime}>{act.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={css.dCard}>
          <span className={css.dLabel}>{t('panorama.recentDeploys')}</span>
          <div className={css.deploysList}>
            {DEPLOYS.map((dep, i) => (
              <div key={i} className={css.deployItem}>
                <span className={clsx(css.deployStatus, dep.status === 'success' ? css.deployStatusSuccess : css.deployStatusFail)} />
                <div className={css.deployInfo}>
                  <strong>{dep.num} {dep.env}</strong>
                  <span>{dep.detail}</span>
                </div>
                <span className={css.deployTime}>{dep.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={clsx(css.dCard, css.terminalCard)}>
          <span className={css.dLabel}>{t('panorama.integratedTerminal')}</span>
          <div className={css.fakeTerm}>
            <p><span className={css.tPath}>~/nommand</span> $ npm run build</p>
            <p className={css.tOut}>&#x2713; Compiled successfully in 1.2s</p>
            <p className={css.tOut}>&#x2713; 47 modules transformed</p>
            <p className={css.tOut}>&#x2713; Bundle size: 142kb (gzip)</p>
            <p><span className={css.tPath}>~/nommand</span> $ <span className={css.blink}>|</span></p>
          </div>
        </div>
      </div>
    </>
  )
}
