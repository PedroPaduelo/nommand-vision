import { useState, useEffect, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import type { FormEvent } from 'react'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useServices, useIncidents, useGlobalStatus } from '@/hooks/queries/useStatusQueries.ts'
import css from './Status.module.css'

function generateUptimeBars(uptime: number, days: number) {
  const bars: Array<'ok' | 'degraded' | 'down' | 'maintenance'> = []
  const downPercent = (100 - uptime) / 100
  const degradedCount = Math.round(days * downPercent * 0.5)
  const downCount = uptime < 99.9 ? Math.round(days * downPercent * 0.3) : 0
  const maintenanceCount = uptime < 100 ? Math.max(0, Math.round(days * downPercent * 0.2)) : 0
  for (let i = 0; i < days; i++) {
    if (i < degradedCount) bars.push('degraded')
    else if (i < degradedCount + downCount) bars.push('down')
    else if (i < degradedCount + downCount + maintenanceCount) bars.push('maintenance')
    else bars.push('ok')
  }
  return bars.reverse()
}

const barClassMap = {
  ok: css.uptimeBarOk,
  degraded: css.uptimeBarDegraded,
  down: css.uptimeBarDown,
  maintenance: css.uptimeBarMaintenance,
}

const badgeClassMap: Record<string, string> = {
  operational: css.statusBadgeOperational,
  degraded: css.statusBadgeDegraded,
  outage: css.statusBadgeOutage,
  down: css.statusBadgeOutage,
  maintenance: css.statusBadgeMaintenance,
}

const badgeLabelMap: Record<string, string> = {
  operational: 'status.badgeOperational',
  degraded: 'status.badgeDegraded',
  outage: 'status.badgeOutage',
  down: 'status.badgeOutage',
  maintenance: 'status.badgeMaintenance',
}

const sevClassMap: Record<string, string> = {
  minor: css.sevMinor,
  major: css.sevMajor,
  critical: css.sevMajor,
  maintenance: css.sevMaintenance,
}

const periodOptions = [
  { labelKey: 'status.period30', value: 30 },
  { labelKey: 'status.period60', value: 60 },
  { labelKey: 'status.period90', value: 90 },
]

export default function Status() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState(90)
  const [search, setSearch] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribedEmail, setSubscribedEmail] = useState('')
  const [email, setEmail] = useState('')
  const [lastUpdate, setLastUpdate] = useState('')
  const [footerTime, setFooterTime] = useState('')

  const { data: services = [], isLoading: servicesLoading } = useServices()
  const { data: incidents = [], isLoading: incidentsLoading } = useIncidents(search || undefined)
  const { data: globalStatus } = useGlobalStatus()

  const updateTimestamps = useCallback(() => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setLastUpdate(`${t('status.updatedAt')} ${timeStr}`)
    setFooterTime(timeStr)
  }, [t])

  useEffect(() => {
    updateTimestamps()
    const interval = setInterval(updateTimestamps, 30000)
    return () => clearInterval(interval)
  }, [updateTimestamps])

  const barsCache = useMemo(() => {
    return services.map(svc => generateUptimeBars(svc.uptime, period))
  }, [period, services])

  const bannerClass = globalStatus?.status === 'operational' ? css.bannerOperational : css.bannerOperational

  const handleSubscribe = useCallback((e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    const subscribers = JSON.parse(localStorage.getItem('status_subscribers') || '[]') as string[]
    if (!subscribers.includes(trimmed)) {
      subscribers.push(trimmed)
      localStorage.setItem('status_subscribers', JSON.stringify(subscribers))
    }
    setSubscribedEmail(trimmed)
    setSubscribed(true)
  }, [email])

  return (
    <div className={css.statusPage}>
      <div className={css.statusHeader}>
        <div className={css.statusLogo}>{'\u25b2'}</div>
        <h1 className={css.statusTitle}>{t('status.pageTitle')}</h1>
        <p className={css.statusSubtitle}>{t('status.subtitle')}</p>
      </div>

      <div className={clsx(css.statusBanner, bannerClass)}>
        <div className={css.statusBannerDot} />
        <div className={css.statusBannerContent}>
          <h2>{t('status.allSystemsOperational')}</h2>
          <p>{t('status.allServicesNormal')}</p>
        </div>
        <div className={css.statusBannerMeta}>
          <div className={css.statusBannerTime}>{lastUpdate || t('status.updatedAgo30s')}</div>
        </div>
      </div>

      <div className={css.statusServices}>
        <div className={css.servicesHeader}>
          <h3>{t('status.services')}</h3>
          <div className={css.periodFilter}>
            {periodOptions.map(p => (
              <button
                key={p.value}
                className={clsx(css.periodBtn, period === p.value && css.periodBtnActive)}
                onClick={() => setPeriod(p.value)}
                type="button"
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>
        {servicesLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '.85rem' }}>{t('common.loading')}</div>
        ) : services.map((svc, si) => (
          <div key={svc.name} className={css.serviceCard}>
            <div className={css.serviceInfo}>
              <div className={css.serviceIcon}>{svc.icon}</div>
              <div>
                <div className={css.serviceName}>{svc.name}</div>
                <div className={css.serviceDesc}>{svc.desc}</div>
              </div>
            </div>
            <div className={css.uptimeBars}>
              {barsCache[si]?.map((bar, i) => (
                <div
                  key={i}
                  className={clsx(css.uptimeBar, barClassMap[bar])}
                  style={{ height: `${60 + ((i * 7 + si * 13) % 40)}%` }}
                  title={bar}
                />
              ))}
            </div>
            <div className={css.serviceStatus}>
              <div className={clsx(css.statusBadge, badgeClassMap[svc.status])}>
                {t(badgeLabelMap[svc.status] ?? 'status.badgeOperational')}
              </div>
              <div className={css.uptimePercent}>{svc.uptime}%</div>
            </div>
          </div>
        ))}
        <div className={css.uptimeLegend}>
          <span className={css.legendItem}><span className={css.legendDot} style={{ background: '#22c55e' }} /> {t('status.badgeOperational')}</span>
          <span className={css.legendItem}><span className={css.legendDot} style={{ background: '#eab308' }} /> {t('status.badgeDegraded')}</span>
          <span className={css.legendItem}><span className={css.legendDot} style={{ background: '#ef4444' }} /> {t('status.badgeOutage')}</span>
          <span className={css.legendItem}><span className={css.legendDot} style={{ background: '#3b82f6' }} /> {t('status.badgeMaintenance')}</span>
        </div>
      </div>

      <div className={css.incidentsSection}>
        <div className={css.incidentsHeader}>
          <h3>{t('status.incidentHistory')}</h3>
          <div className={css.incidentsSearch}>
            <span>{'\ud83d\udd0d'}</span>
            <input type="text" placeholder={t('status.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {incidentsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '.85rem' }}>{t('common.loading')}</div>
        ) : incidents.map(inc => (
          <div key={inc.id} className={css.incidentCard}>
            <div className={css.incidentTop}>
              <div className={css.incidentTitle}>
                <span className={clsx(css.incidentSev, sevClassMap[inc.severity])}>{inc.severity}</span>
                {inc.title}
              </div>
              <span className={css.incidentTime}>{inc.status}</span>
            </div>
            <div className={css.incidentTimeline}>
              {inc.updates.map((u, ui) => (
                <div key={ui} className={clsx(css.incidentUpdate, ui === inc.updates.length - 1 && css.incidentUpdateResolved)}>
                  <span className={css.incidentUpdateTime}>{u.time}</span>
                  <span>{u.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={css.subscribeForm}>
        <div className={css.subscribeInfo}>
          <h4>{t('status.receiveUpdates')}</h4>
          <p>{t('status.receiveUpdatesDesc')}</p>
        </div>
        {subscribed ? (
          <div className={css.successMsg}>
            <span>{'\u2713'}</span>
            {t('status.subscribedSuccess')} {subscribedEmail}
          </div>
        ) : (
          <form className={css.subscribeFormInner} onSubmit={handleSubscribe}>
            <input
              type="email"
              className={css.subscribeInput}
              placeholder={t('status.emailPlaceholder')}
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className={css.btnSubscribe}>{t('status.subscribe')}</button>
          </form>
        )}
      </div>

      <div className={css.statusFooter}>
        <p>
          <a href="#">{t('status.dashboard')}</a> {'\u00b7'} <a href="#">{t('status.support')}</a> {'\u00b7'} <a href="#">{t('status.apiStatus')}</a> {'\u00b7'} {t('status.updated')}: {footerTime || '--:--'}
        </p>
      </div>
    </div>
  )
}
