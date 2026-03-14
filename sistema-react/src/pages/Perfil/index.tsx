import { useState, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useProfile, useContributions, useActivities, useSessions, useUpdateProfile } from '@/hooks/queries/useProfileQueries.ts'
import css from './Perfil.module.css'

const filterOptions = [
  { key: 'all', labelKey: 'perfil.filterAll' },
  { key: 'deploy', labelKey: 'perfil.filterDeploys' },
  { key: 'code', labelKey: 'perfil.filterCode' },
  { key: 'ai', labelKey: 'perfil.filterAi' },
]

export default function Perfil() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [filter, setFilter] = useState('all')
  const [revokedSessions, setRevokedSessions] = useState<Set<number>>(new Set())

  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: contributions = [], isLoading: contribLoading } = useContributions()
  const { data: activitiesData = [], isLoading: activitiesLoading } = useActivities(filter === 'all' ? undefined : filter)
  const { data: sessionsData = [], isLoading: sessionsLoading } = useSessions()
  const updateProfileMutation = useUpdateProfile()

  const name = profile?.name ?? 'Alex Johnson'
  const bio = profile?.bio ?? ''
  const initials = profile?.initials ?? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  const handle = profile?.handle ?? `@${name.toLowerCase().replace(/\s/g, '.')}`
  const stack = profile?.stack ?? []

  const contribData = useMemo(() => {
    if (!contributions.length) return { cells: [], total: 0, streak: 0, maxStreak: 0, avg: '0.0' }

    let total = 0
    let currentStreak = 0
    let maxStreak = 0

    const cells = contributions.map(c => {
      const d = new Date(c.date)
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      total += c.count
      if (c.count > 0) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak) }
      else { currentStreak = 0 }
      return { count: c.count, dateStr }
    })

    return { cells, total, streak: currentStreak, maxStreak, avg: (total / contributions.length).toFixed(1) }
  }, [contributions])

  const handleStartEdit = useCallback(() => {
    setEditName(name)
    setEditBio(bio)
    setEditing(true)
  }, [name, bio])

  const handleSave = useCallback(() => {
    const newName = editName.trim() || name
    const newBio = editBio.trim() || bio
    updateProfileMutation.mutate({ name: newName, bio: newBio })
    setEditing(false)
  }, [editName, editBio, name, bio, updateProfileMutation])

  const handleRevoke = useCallback((idx: number) => {
    setRevokedSessions(prev => new Set(prev).add(idx))
  }, [])

  const getCellColor = (count: number) => {
    if (count >= 7) return 'rgba(34,197,94,.7)'
    if (count >= 4) return 'rgba(34,197,94,.4)'
    if (count >= 1) return 'rgba(34,197,94,.2)'
    return 'rgba(255,255,255,.05)'
  }

  if (profileLoading) {
    return (
      <div className={css.profileLayout}>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '.85rem' }}>{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className={css.profileLayout}>
      <div>
        <div className={css.profileCard}>
          <div className={css.profileCover} />
          <div className={css.profileBody}>
            <div className={css.profileAvatarWrap}>
              <div className={css.profileAvatar}>{initials}</div>
              <div className={css.onlineDot} />
            </div>
            {editing ? (
              <input className={css.editInput} value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
            ) : (
              <div className={css.profileName}>{name}</div>
            )}
            <div className={css.profileHandle}>{handle}</div>
            {editing ? (
              <textarea className={css.editTextarea} value={editBio} onChange={e => setEditBio(e.target.value)} />
            ) : (
              <div className={css.profileBio} onClick={handleStartEdit}>{bio}</div>
            )}
            <div className={css.profileBadges}>
              <span className={clsx(css.profileBadge, css.profileBadgePlan)}>{'\u26a1'} {profile?.plan ?? 'Pro Plan'}</span>
              <span className={clsx(css.profileBadge, css.profileBadgeRole)}>{profile?.role ?? 'Frontend Engineer'}</span>
            </div>
            <div className={css.profileStats}>
              <div className={css.profileStat}><span className={css.profileStatVal}>{profile?.commits ?? 0}</span><span className={css.profileStatLabel}>{t('perfil.commits')}</span></div>
              <div className={css.profileStat}><span className={css.profileStatVal}>{profile?.deploys ?? 0}</span><span className={css.profileStatLabel}>{t('perfil.deploys')}</span></div>
              <div className={css.profileStat}><span className={css.profileStatVal}>{profile?.prsMerged ?? 0}</span><span className={css.profileStatLabel}>{t('perfil.reviews')}</span></div>
              <div className={css.profileStat}><span className={css.profileStatVal}>{contribData.streak}</span><span className={css.profileStatLabel}>{t('perfil.streak')}</span></div>
            </div>
            <div className={css.profileActions}>
              {editing ? (
                <button className={css.saveBtn} onClick={handleSave} type="button">{t('perfil.save')}</button>
              ) : (
                <button className={clsx(css.profileBtn, css.profileBtnPrimary)} onClick={handleStartEdit} type="button">{t('perfil.editProfile')}</button>
              )}
              <button className={css.profileBtn} onClick={() => navigate('/configuracoes')} type="button">{t('perfil.settings')}</button>
            </div>
            <div className={css.profileJoined}>{t('perfil.memberSince')}</div>
            <div className={css.stackSection}>
              <div className={css.stackLabel}>{t('perfil.stack')}</div>
              <div className={css.stackTags}>
                {stack.map((s, i) => <span key={i} className={css.stackTag}>{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={css.profileRight}>
        <div className={css.profileSection}>
          <div className={css.profileSectionHeader}>
            <h3>{t('perfil.contributions')} <span>{t('perfil.last90days')}</span></h3>
          </div>
          {contribLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '.85rem' }}>{t('common.loading')}</div>
          ) : (
            <>
              <div className={css.contribSummary}>
                <div className={css.contribSummaryItem}><span className={css.contribSummaryVal}>{contribData.total}</span><span className={css.contribSummaryLabel}>{t('perfil.total')}</span></div>
                <div className={css.contribSummaryItem}><span className={css.contribSummaryVal}>{contribData.streak}</span><span className={css.contribSummaryLabel}>{t('perfil.currentStreak')}</span></div>
                <div className={css.contribSummaryItem}><span className={css.contribSummaryVal}>{contribData.maxStreak}</span><span className={css.contribSummaryLabel}>{t('perfil.longestStreak')}</span></div>
                <div className={css.contribSummaryItem}><span className={css.contribSummaryVal}>{contribData.avg}</span><span className={css.contribSummaryLabel}>{t('perfil.avgPerDay')}</span></div>
              </div>
              <div className={css.contributionsGrid}>
                {contribData.cells.map((d, i) => (
                  <div key={i} className={css.contribCell} style={{ background: getCellColor(d.count) }} title={`${d.count} contribuicoes em ${d.dateStr}`} />
                ))}
              </div>
              <div className={css.contribLegend}>
                <span style={{ color: '#555', marginRight: 4 }}>{t('perfil.less')}</span>
                <span className={css.contribLegendItem}><span className={css.contribLegendDot} style={{ background: 'rgba(255,255,255,.05)' }} /></span>
                <span className={css.contribLegendItem}><span className={css.contribLegendDot} style={{ background: 'rgba(34,197,94,.2)' }} /></span>
                <span className={css.contribLegendItem}><span className={css.contribLegendDot} style={{ background: 'rgba(34,197,94,.4)' }} /></span>
                <span className={css.contribLegendItem}><span className={css.contribLegendDot} style={{ background: 'rgba(34,197,94,.7)' }} /></span>
                <span style={{ color: '#555', marginLeft: 4 }}>{t('perfil.more')}</span>
              </div>
            </>
          )}
        </div>

        <div className={css.profileSection}>
          <div className={css.profileSectionHeader}>
            <h3>{t('perfil.recentActivity')} <span>{t('perfil.today')}</span></h3>
          </div>
          <div className={css.activityFilters}>
            {filterOptions.map(f => (
              <button
                key={f.key}
                className={clsx(css.activityFilter, filter === f.key && css.activityFilterActive)}
                onClick={() => setFilter(f.key)}
                type="button"
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
          <div className={css.activityTimeline}>
            {activitiesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '.85rem' }}>{t('common.loading')}</div>
            ) : activitiesData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.82rem', padding: '2rem 0' }}>{t('perfil.noActivity')}</p>
            ) : activitiesData.map((a, i) => (
              <div key={i} className={css.tlItem}>
                <div className={css.tlIcon} style={{ background: a.color }}>{'\u2022'}</div>
                <div className={css.tlContent}>
                  <div className={css.tlText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.text) }} />
                  <div className={css.tlMeta}>
                    <span className={css.tlTime}>{a.time}</span>
                    {a.tag && <span className={css.tlTag} style={{ background: a.tagColor, color: a.tagTextColor }}>{a.tag}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={css.profileSection}>
          <div className={css.profileSectionHeader}>
            <h3>{t('perfil.activeSessions')} <span>{sessionsData.length} {t('perfil.devices')}</span></h3>
          </div>
          <div className={css.sessionsList}>
            {sessionsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '.85rem' }}>{t('common.loading')}</div>
            ) : sessionsData.map((s, i) => {
              const revoked = revokedSessions.has(i)
              return (
                <div key={i} className={css.sessionRow} style={revoked ? { opacity: 0.3 } : undefined}>
                  <div className={css.sessionIcon}>{s.device}</div>
                  <div className={css.sessionInfo}>
                    <div className={css.sessionName}>
                      {s.name}
                      {s.current && <span className={css.sessionCurrent}>{t('perfil.thisDevice')}</span>}
                    </div>
                  </div>
                  {!s.current && (
                    <button
                      className={css.btnRevoke}
                      onClick={() => handleRevoke(i)}
                      disabled={revoked}
                      type="button"
                    >
                      {revoked ? t('perfil.revoked') : t('perfil.revoke')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
