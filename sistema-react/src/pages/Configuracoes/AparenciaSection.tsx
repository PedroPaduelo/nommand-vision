import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useSettings } from '@/hooks/queries/useSettingsQueries.ts'
import css from './Configuracoes.module.css'

const accentColors = [
  { color: '#6366f1', name: 'Indigo' },
  { color: '#3b82f6', name: 'Blue' },
  { color: '#22c55e', name: 'Green' },
  { color: '#c026d3', name: 'Fuchsia' },
  { color: '#eab308', name: 'Yellow' },
  { color: '#ef4444', name: 'Red' },
]

export default function AparenciaSection() {
  const { t } = useTranslation()
  const { data: settings, isLoading } = useSettings()
  const [theme, setTheme] = useState('dark')
  const [accent, setAccent] = useState(() => localStorage.getItem('nexus_accent') || '#6366f1')
  const [compactSidebar, setCompactSidebar] = useState(false)
  const [animations, setAnimations] = useState(true)

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme)
      setAccent(settings.accentColor)
      setCompactSidebar(settings.compactSidebar)
      setAnimations(settings.animations)
    }
  }, [settings])

  if (isLoading) {
    return (
      <div className={css.settingsSection}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          {t('common.loading') || 'Carregando...'}
        </div>
      </div>
    )
  }

  const handleAccent = (color: string) => {
    setAccent(color)
    localStorage.setItem('nexus_accent', color)
  }

  return (
    <div className={css.settingsSection}>
      <h3>{t('config.appearance')}</h3>
      <p className={css.settingsSectionDesc}>{t('config.appearanceDesc')}</p>

      <div className={css.settingsCard}>
        <div className={css.settingsCardTitle}>{t('config.theme')}</div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.theme')}</strong>
            <span>{theme === 'dark' ? t('config.darkThemeActive') : t('config.lightThemeActive')}</span>
          </div>
          <select className={css.formSelect} style={{ width: 150 }} value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="dark">{t('config.themeDark')}</option>
            <option value="light">{t('config.themeLight')}</option>
          </select>
        </div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.accentColor')}</strong>
            <span>{t('config.accentColorDesc')}</span>
          </div>
          <div className={css.colorOptions}>
            {accentColors.map(c => (
              <div
                key={c.color}
                className={clsx(css.colorOpt, c.color === accent && css.colorOptActive)}
                style={{ background: c.color }}
                title={c.name}
                onClick={() => handleAccent(c.color)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={css.settingsCard}>
        <div className={css.settingsCardTitle}>{t('config.interface')}</div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.compactSidebar')}</strong>
            <span>{t('config.compactSidebarDesc')}</span>
          </div>
          <button className={clsx(css.toggle, compactSidebar && css.toggleOn)} onClick={() => setCompactSidebar(!compactSidebar)} type="button" />
        </div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.animations')}</strong>
            <span>{t('config.animationsDesc')}</span>
          </div>
          <button className={clsx(css.toggle, animations && css.toggleOn)} onClick={() => setAnimations(!animations)} type="button" />
        </div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.font')}</strong>
            <span>{t('config.fontDesc')}</span>
          </div>
          <select className={css.formSelect} style={{ width: 150 }} defaultValue={settings?.font ?? 'Inter'}>
            <option>Inter</option>
            <option>SF Pro</option>
            <option>Geist</option>
          </select>
        </div>
        <div className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t('config.fontSize')}</strong>
            <span>{t('config.fontSizeDesc')}</span>
          </div>
          <select className={css.formSelect} style={{ width: 150 }} defaultValue={settings?.fontSize ?? 'medium'}>
            <option value="small">{t('config.fontSizeSmall')}</option>
            <option value="medium">{t('config.fontSizeMedium')}</option>
            <option value="large">{t('config.fontSizeLarge')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}
