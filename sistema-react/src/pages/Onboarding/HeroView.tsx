import { useEffect } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import css from './Onboarding.module.css'

interface HeroViewProps {
  onAdvance: () => void
}

export default function HeroView({ onAdvance }: HeroViewProps) {
  const { t } = useTranslation()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onAdvance])

  return (
    <div className={css.heroCenter}>
      <div className={clsx(css.heroBadge, css.animIn)}>
        {t('onboarding.badge')}
      </div>

      <h1 className={clsx(css.heroTitle, css.animIn, css.d1)}>
        {t('onboarding.heroTitle')}
      </h1>

      <p
        className={clsx(css.heroSub, css.animIn, css.d2)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(t('onboarding.heroSub')) }}
      />

      <button
        className={clsx(css.btnPrimary, css.animIn, css.d3)}
        onClick={onAdvance}
        autoFocus
      >
        <span className={css.btnGlow} />
        {t('onboarding.startSetup')} <kbd>Enter &#x21B5;</kbd>
      </button>

      <div className={clsx(css.heroTrust, css.animIn, css.d4)}>
        <div className={css.trustAvatars}>
          <span className={css.trustAv} style={{ background: '#60a5fa' }}>MK</span>
          <span className={css.trustAv} style={{ background: '#10b981' }}>LS</span>
          <span className={css.trustAv} style={{ background: '#c026d3' }}>AR</span>
          <span className={css.trustAv} style={{ background: '#f59e0b' }}>JP</span>
        </div>
        <span className={css.trustText}>{t('onboarding.trustText')}</span>
      </div>
    </div>
  )
}
