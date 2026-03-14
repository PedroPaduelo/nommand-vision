import { useState, useCallback } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useApiKeys, useGenerateApiKey } from '@/hooks/queries/useSettingsQueries.ts'
import css from './Configuracoes.module.css'

interface ApiKeyLocal {
  key: string
  status: 'active' | 'test' | 'revoked'
  date: string
  copied: boolean
}

function maskKey(key: string): string {
  return key.substring(0, 12) + '...' + key.substring(key.length - 4)
}

const statusClassMap = {
  active: css.apiKeyStatusActive,
  test: css.apiKeyStatusTest,
  revoked: css.apiKeyStatusRevoked,
}

const statusLabelMap = {
  active: 'config.apiKeyActive',
  test: 'config.apiKeyTest',
  revoked: 'config.apiKeyRevoked',
}

export default function ApiKeysSection() {
  const { t } = useTranslation()
  const { data: apiKeysData, isLoading } = useApiKeys()
  const generateApiKeyMutation = useGenerateApiKey()
  const [localKeys, setLocalKeys] = useState<ApiKeyLocal[]>([])
  const [initialized, setInitialized] = useState(false)

  if (apiKeysData && !initialized) {
    setLocalKeys(apiKeysData.map(k => ({ ...k, copied: false })))
    setInitialized(true)
  }

  const keys = localKeys

  const handleGenerate = useCallback(() => {
    generateApiKeyMutation.mutate(undefined, {
      onSuccess: (newKey) => {
        setLocalKeys(prev => [{ ...newKey, copied: false }, ...prev])
      },
    })
  }, [generateApiKeyMutation])

  const handleCopy = useCallback((idx: number) => {
    const k = keys[idx]
    navigator.clipboard.writeText(k.key).catch(() => {})
    setLocalKeys(prev => prev.map((item, i) => i === idx ? { ...item, copied: true } : item))
    setTimeout(() => {
      setLocalKeys(prev => prev.map((item, i) => i === idx ? { ...item, copied: false } : item))
    }, 2000)
  }, [keys])

  const handleRevoke = useCallback((idx: number) => {
    if (!window.confirm(t('config.revokeConfirm'))) return
    setLocalKeys(prev => prev.map((item, i) => i === idx ? { ...item, status: 'revoked' as const } : item))
  }, [t])

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
      <h3>{t('config.apiKeys')}</h3>
      <p className={css.settingsSectionDesc}>{t('config.apiKeysDesc')}</p>

      <div style={{ marginBottom: '1.2rem' }}>
        <button className={css.btnPrimary} onClick={handleGenerate} disabled={generateApiKeyMutation.isPending} type="button">
          {generateApiKeyMutation.isPending ? (t('common.loading') || '...') : t('config.newApiKey')}
        </button>
      </div>

      <div>
        {keys.map((k, i) => (
          <div key={`${k.key}-${i}`} className={css.apiKeyRow}>
            <div className={css.apiKey}>
              <span className={css.apiKeyText}>{maskKey(k.key)}</span>
              {k.status !== 'revoked' && (
                <button
                  className={clsx(css.btnCopy, k.copied && css.btnCopyCopied)}
                  onClick={() => handleCopy(i)}
                  type="button"
                >
                  {k.copied ? '\u2713' : t('config.copy')}
                </button>
              )}
            </div>
            <span className={clsx(css.apiKeyStatus, statusClassMap[k.status])}>{t(statusLabelMap[k.status])}</span>
            <span className={css.apiKeyDate}>{k.date}</span>
            <button
              className={css.btnRevoke}
              onClick={() => handleRevoke(i)}
              disabled={k.status === 'revoked'}
              type="button"
            >
              {k.status === 'revoked' ? t('config.apiKeyRevoked') : t('config.revokeKey')}
            </button>
          </div>
        ))}
      </div>

      <div className={css.warningBox}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{'\u26a0\ufe0f'}</span>
        <div>
          <span className={css.warningTitle}>{t('config.keepKeysSecure')}</span>
          <span className={css.warningText}>{t('config.keepKeysSecureDesc')}</span>
        </div>
      </div>
    </div>
  )
}
