import { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'
import type { Role } from '@/types/index.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Onboarding.module.css'

interface RoleViewProps {
  onSelect: (role: Role) => void
}

const ROLES: { role: Role; emoji: string; titleKey: string; descKey: string }[] = [
  { role: 'Frontend', emoji: '\u269B\uFE0F', titleKey: 'onboarding.frontend', descKey: 'onboarding.frontendDesc' },
  { role: 'Backend', emoji: '\u2699\uFE0F', titleKey: 'onboarding.backend', descKey: 'onboarding.backendDesc' },
  { role: 'Design', emoji: '\u2728', titleKey: 'onboarding.design', descKey: 'onboarding.designDesc' },
  { role: 'Data', emoji: '\uD83D\uDCCA', titleKey: 'onboarding.dataEng', descKey: 'onboarding.dataDesc' },
]

export default function RoleView({ onSelect }: RoleViewProps) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const cards = containerRef.current?.querySelectorAll<HTMLDivElement>(`.${css.nexusCard}`)
    cards?.forEach(card => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      card.style.setProperty('--my', (e.clientY - r.top) + 'px')
    })
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      let next = selected
      if (e.key === 'ArrowRight') next = Math.min(selected + 1, 3)
      else if (e.key === 'ArrowLeft') next = Math.max(selected - 1, 0)
      else if (e.key === 'ArrowDown') next = Math.min(selected + 2, 3)
      else if (e.key === 'ArrowUp') next = Math.max(selected - 2, 0)
      else if (e.key === 'Enter') {
        e.preventDefault()
        onSelect(ROLES[selected].role)
        return
      } else {
        return
      }

      if (next !== selected) {
        e.preventDefault()
        setSelected(next)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selected, onSelect])

  return (
    <div className={css.contentBox}>
      <h2 className={css.viewTitle}>{t('onboarding.domainTitle')}</h2>
      <p className={css.viewDesc}>{t('onboarding.domainDesc')}</p>

      <div
        className={css.gridLayout}
        ref={containerRef}
        onMouseMove={handleMouseMove}
      >
        {ROLES.map((item, i) => (
          <div
            key={item.role}
            className={clsx(css.nexusCard, selected === i && css.nexusCardSelected)}
            tabIndex={-1}
            onClick={() => {
              setSelected(i)
              onSelect(item.role)
            }}
          >
            <div className={css.cardGlow} />
            <div className={css.cardBody}>
              <div className={css.ico}>{item.emoji}</div>
              <h3>{t(item.titleKey)}</h3>
              <p>{t(item.descKey)}</p>
            </div>
            <div className={css.cardArrow}>&rarr;</div>
          </div>
        ))}
      </div>

      <div className={css.hintBar}>
        {t('onboarding.hintBar')} <kbd>&larr;</kbd> <kbd>&rarr;</kbd> <kbd>&uarr;</kbd> <kbd>&darr;</kbd> {t('onboarding.and')} <kbd>Enter</kbd>
      </div>
    </div>
  )
}
