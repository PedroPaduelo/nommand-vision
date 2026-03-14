import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './TourOverlay.module.css'

interface TourStep {
  target: string
  titleKey: string
  descKey: string
  position: 'right' | 'bottom'
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar-nav"]',
    titleKey: 'tour.navigation.title',
    descKey: 'tour.navigation.desc',
    position: 'right',
  },
  {
    target: '#btn-cmdk',
    titleKey: 'tour.search.title',
    descKey: 'tour.search.desc',
    position: 'bottom',
  },
  {
    target: '#notif-btn',
    titleKey: 'tour.notifications.title',
    descKey: 'tour.notifications.desc',
    position: 'bottom',
  },
  {
    target: '[data-tour="welcome-banner"]',
    titleKey: 'tour.panorama.title',
    descKey: 'tour.panorama.desc',
    position: 'bottom',
  },
]

export function TourOverlay() {
  const { user, updateUser } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()
  const [step, setStep] = useState(0)
  const [active, setActive] = useState(false)
  const [spotStyle, setSpotStyle] = useState<React.CSSProperties>({})
  const [tipStyle, setTipStyle] = useState<React.CSSProperties>({})
  const [showTip, setShowTip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const shouldShow = user.onboarded && !user.tourDone && location.pathname === '/panorama'

  useEffect(() => {
    if (shouldShow) {
      timerRef.current = setTimeout(() => {
        setActive(true)
        positionStep(0)
      }, 800)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [shouldShow])

  const positionStep = useCallback((idx: number) => {
    const s = STEPS[idx]
    if (!s) return
    const el = document.querySelector(s.target)
    if (!el) {
      finish()
      return
    }

    const rect = el.getBoundingClientRect()
    const pad = 8

    setSpotStyle({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })

    const tw = 320
    let top: number
    let left: number

    if (s.position === 'right') {
      top = rect.top
      left = rect.right + 16
    } else {
      top = rect.bottom + 12
      left = rect.left + rect.width / 2 - tw / 2
    }

    if (left + tw > window.innerWidth - 20) left = window.innerWidth - tw - 20
    if (left < 20) left = 20

    setTipStyle({ top, left })
    setShowTip(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShowTip(true))
    })
  }, [])

  const finish = useCallback(() => {
    setActive(false)
    updateUser({ tourDone: true })
  }, [updateUser])

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      const next = step + 1
      setStep(next)
      positionStep(next)
    } else {
      finish()
    }
  }, [step, positionStep, finish])

  if (!active) return null

  const currentStep = STEPS[step]

  return (
    <>
      <div className={styles.tourOverlay} />
      <div className={styles.tourSpotlight} style={spotStyle} />
      <div
        className={clsx(styles.tourTooltip, showTip && styles.tourTooltipShow)}
        style={tipStyle}
      >
        <div className={styles.tourTooltipTitle}>{t(currentStep.titleKey)}</div>
        <div className={styles.tourTooltipDesc}>{t(currentStep.descKey)}</div>
        <div className={styles.tourTooltipFooter}>
          <span className={styles.tourTooltipProgress}>
            {step + 1} / {STEPS.length}
          </span>
          <div className={styles.tourTooltipActions}>
            <button className={styles.tourBtnSkip} onClick={finish}>
              {t('tour.skip')}
            </button>
            <button className={styles.tourBtnNext} onClick={handleNext}>
              {step === STEPS.length - 1 ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
