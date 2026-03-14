import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useSettings } from '@/hooks/queries/useSettingsQueries.ts'
import css from './Configuracoes.module.css'

export default function NotificacoesSection() {
  const { t } = useTranslation()
  const { data: settings, isLoading } = useSettings()
  const [deployComplete, setDeployComplete] = useState(true)
  const [deployFail, setDeployFail] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState(false)
  const [perfAlerts, setPerfAlerts] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  useEffect(() => {
    if (settings) {
      setDeployComplete(settings.notifDeploy)
      setDeployFail(settings.notifDeployFail)
      setMentions(settings.notifMention)
      setAiSuggestions(settings.notifAi)
      setPerfAlerts(settings.notifPerf)
      setEmailDigest(settings.notifEmail)
    }
  }, [settings])

  const toggles = [
    { category: t('config.categoryDeploys'), items: [
      { label: t('config.deployCompleted'), desc: t('config.deployCompletedDesc'), value: deployComplete, set: setDeployComplete },
      { label: t('config.deployFailed'), desc: t('config.deployFailedDesc'), value: deployFail, set: setDeployFail },
    ]},
    { category: t('config.categoryCommunication'), items: [
      { label: t('config.mentions'), desc: t('config.mentionsDesc'), value: mentions, set: setMentions },
      { label: t('config.aiSuggestions'), desc: t('config.aiSuggestionsDesc'), value: aiSuggestions, set: setAiSuggestions },
    ]},
    { category: t('config.categoryAlerts'), items: [
      { label: t('config.perfAlerts'), desc: t('config.perfAlertsDesc'), value: perfAlerts, set: setPerfAlerts },
      { label: t('config.emailDigest'), desc: t('config.emailDigestDesc'), value: emailDigest, set: setEmailDigest },
    ]},
  ]

  if (isLoading) {
    return (
      <div className={css.settingsSection}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          {t('common.loading') || 'Carregando...'}
        </div>
      </div>
    )
  }

  return (
    <div className={css.settingsSection}>
      <h3>{t('config.notifications')}</h3>
      <p className={css.settingsSectionDesc}>{t('config.notificationsDesc')}</p>

      {toggles.map(group => (
        <div key={group.category} className={css.settingsCard}>
          <div className={css.settingsCardTitle}>{group.category}</div>
          {group.items.map(t => (
            <div key={t.label} className={css.settingsRow}>
              <div className={css.settingsRowLeft}>
                <strong>{t.label}</strong>
                <span>{t.desc}</span>
              </div>
              <button className={clsx(css.toggle, t.value && css.toggleOn)} onClick={() => t.set(!t.value)} type="button" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
