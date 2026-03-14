import { useState, useCallback } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useIntegrations, useToggleIntegration } from '@/hooks/queries/useSettingsQueries.ts'
import css from './Configuracoes.module.css'

export default function IntegracoesSection() {
  const { t } = useTranslation()
  const { data: integrationsList, isLoading } = useIntegrations()
  const toggleMutation = useToggleIntegration()
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleToggle = useCallback((key: string, connected: boolean) => {
    if (connected) {
      if (!window.confirm(`${t('config.disconnectConfirm')} ${key}?`)) return
    }
    setConnecting(key)
    toggleMutation.mutate(key, {
      onSettled: () => setConnecting(null),
    })
  }, [t, toggleMutation])

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
      <h3>{t('config.integrations')}</h3>
      <p className={css.settingsSectionDesc}>{t('config.integrationsDesc')}</p>

      <div className={css.connectedGrid}>
        {(integrationsList ?? []).map(i => {
          const isConnecting = connecting === i.key
          return (
            <div key={i.key} className={css.connectedCard}>
              <div className={css.connectedCardHead}>
                <div className={css.connectedCardIcon}>{i.icon}</div>
                <span className={clsx(css.connectedStatus, i.connected ? css.connectedStatusOn : css.connectedStatusOff)}>
                  {i.connected ? t('config.connected') : t('config.disconnected')}
                </span>
              </div>
              <div className={css.connectedCardName}>{i.name}</div>
              <div className={css.connectedCardDesc}>{i.desc}</div>
              <div className={css.connectedCardActions}>
                <button
                  className={clsx(css.btnConnect, i.connected ? css.btnDisconnect : css.btnConnectAction)}
                  onClick={() => handleToggle(i.key, i.connected)}
                  disabled={isConnecting}
                  type="button"
                >
                  {isConnecting ? t('config.connecting') : i.connected ? t('config.disconnect') : t('config.connect')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
