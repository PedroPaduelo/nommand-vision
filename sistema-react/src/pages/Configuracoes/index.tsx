import { useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Configuracoes.module.css'
import GeralSection from './GeralSection'
import AparenciaSection from './AparenciaSection'
import NotificacoesSection from './NotificacoesSection'
import IntegracoesSection from './IntegracoesSection'
import ApiKeysSection from './ApiKeysSection'
import BillingSection from './BillingSection'

type SectionKey = 'geral' | 'aparencia' | 'notificacoes' | 'integracoes' | 'api-keys' | 'billing'

interface NavItem {
  key: SectionKey
  icon: string
  labelKey: string
}

interface NavGroup {
  titleKey: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    titleKey: 'config.groupWorkspace',
    items: [
      { key: 'geral', icon: '\u2699', labelKey: 'config.navGeneral' },
      { key: 'aparencia', icon: '\ud83c\udfa8', labelKey: 'config.navAppearance' },
      { key: 'notificacoes', icon: '\ud83d\udd14', labelKey: 'config.navNotifications' },
    ],
  },
  {
    titleKey: 'config.groupDevelopers',
    items: [
      { key: 'integracoes', icon: '\ud83d\udd17', labelKey: 'config.navIntegrations' },
      { key: 'api-keys', icon: '\ud83d\udd11', labelKey: 'config.navApiKeys' },
    ],
  },
  {
    titleKey: 'config.groupAccount',
    items: [
      { key: 'billing', icon: '\ud83d\udcb3', labelKey: 'config.navBilling' },
    ],
  },
]

const sectionComponents: Record<SectionKey, React.FC> = {
  geral: GeralSection,
  aparencia: AparenciaSection,
  notificacoes: NotificacoesSection,
  integracoes: IntegracoesSection,
  'api-keys': ApiKeysSection,
  billing: BillingSection,
}

export default function Configuracoes() {
  const { t } = useTranslation()
  const [active, setActive] = useState<SectionKey>('geral')
  const ActiveSection = sectionComponents[active]

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.2rem' }}>{t('config.title')}</h2>

      <div className={css.settingsLayout}>
        <nav className={css.settingsNav}>
          {navGroups.map(group => (
            <div key={group.titleKey}>
              <div className={css.settingsNavLabel}>{t(group.titleKey)}</div>
              {group.items.map(item => (
                <button
                  key={item.key}
                  className={clsx(css.settingsNavItem, active === item.key && css.settingsNavItemActive)}
                  onClick={() => setActive(item.key)}
                  type="button"
                >
                  <span className={css.navIcon}>{item.icon}</span>
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className={css.settingsContent}>
          <ActiveSection />
        </div>
      </div>
    </div>
  )
}
