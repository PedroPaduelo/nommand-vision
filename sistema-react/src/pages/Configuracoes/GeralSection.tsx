import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useSettings } from '@/hooks/queries/useSettingsQueries.ts'
import css from './Configuracoes.module.css'

export default function GeralSection() {
  const { t } = useTranslation()
  const { data: settings, isLoading } = useSettings()
  const [devMode, setDevMode] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [telemetry, setTelemetry] = useState(false)

  useEffect(() => {
    if (settings) {
      setDevMode(settings.devMode)
      setAutoSave(settings.autoSave)
      setTelemetry(settings.telemetry)
    }
  }, [settings])

  const handleDeleteWorkspace = () => {
    if (window.confirm(t('config.deleteConfirm'))) {
      localStorage.clear()
      window.location.href = '/'
    }
  }

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
      <h3>{t('config.general')}</h3>
      <p className={css.settingsSectionDesc}>{t('config.generalDesc')}</p>

      <div className={css.settingsCard}>
        <div className={css.settingsCardTitle}>{t('config.workspace')}</div>
        <div className={css.formGroup}>
          <label>{t('config.workspaceName')}</label>
          <input type="text" className={css.formInput} defaultValue={settings?.workspaceName ?? 'nommand-frontend-workspace'} />
        </div>
        <div className={css.formGroup}>
          <label>{t('config.region')}</label>
          <select className={css.formSelect} defaultValue={settings?.region ?? 'sa-east-1'}>
            <option value="sa-east-1">South America (sa-east-1)</option>
            <option value="us-east-1">US East (us-east-1)</option>
            <option value="eu-west-1">Europe (eu-west-1)</option>
            <option value="ap-southeast-1">Asia Pacific (ap-southeast-1)</option>
          </select>
        </div>
        <div className={css.formGroup} style={{ marginBottom: 0 }}>
          <label>{t('config.projectDomain')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <input type="text" className={css.formInput} defaultValue={settings?.domain ?? 'frontend'} style={{ borderRadius: '6px 0 0 6px', flex: 1 }} />
            <span style={{ background: 'var(--border)', padding: '8px 12px', fontSize: '.82rem', color: 'var(--muted)', borderRadius: '0 6px 6px 0', border: '1px solid var(--border)', borderLeft: 'none' }}>.nommand.dev</span>
          </div>
        </div>
      </div>

      <div className={css.settingsCard}>
        <div className={css.settingsCardTitle}>{t('config.preferences')}</div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.devMode')}</strong>
            <span>{t('config.devModeDesc')}</span>
          </div>
          <button className={clsx(css.toggle, devMode && css.toggleOn)} onClick={() => setDevMode(!devMode)} type="button" />
        </div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.autoSave')}</strong>
            <span>{t('config.autoSaveDesc')}</span>
          </div>
          <button className={clsx(css.toggle, autoSave && css.toggleOn)} onClick={() => setAutoSave(!autoSave)} type="button" />
        </div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.telemetry')}</strong>
            <span>{t('config.telemetryDesc')}</span>
          </div>
          <button className={clsx(css.toggle, telemetry && css.toggleOn)} onClick={() => setTelemetry(!telemetry)} type="button" />
        </div>
      </div>

      <div className={css.dangerZone}>
        <div className={css.dangerZoneTitle}>{t('config.dangerZone')}</div>
        <div className={css.dangerZoneRow}>
          <p>{t('config.deleteDesc')}</p>
          <button className={css.btnDanger} onClick={handleDeleteWorkspace} type="button">{t('config.deleteWorkspace')}</button>
        </div>
      </div>
    </div>
  )
}
