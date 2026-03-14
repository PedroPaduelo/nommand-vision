import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTheme } from '@/hooks/useTheme.ts'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './Sidebar.module.css'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

const navItems = [
  {
    key: 'panorama',
    path: '/panorama',
    i18n: 'nav.panorama',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="5" height="5" rx="1" />
        <rect x="9" y="1" width="5" height="5" rx="1" />
        <rect x="1" y="9" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    key: 'projetos',
    path: '/projetos',
    i18n: 'nav.projects',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h11M2 7.5h11M2 12h7" />
      </svg>
    ),
  },
  {
    key: 'inbox',
    path: '/inbox',
    i18n: 'nav.inbox',
    badge: '3',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1.5 4l5.25 4.5L12 4" />
        <rect x="1" y="3" width="13" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'analytics',
    path: '/analytics',
    i18n: 'nav.analytics',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 13L5 8l3 3 5-7" />
      </svg>
    ),
  },
  {
    key: 'nommand-ai',
    path: '/nommand-ai',
    i18n: 'nav.nommandAi',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7.5" cy="7.5" r="6" />
        <path d="M5 7.5h5M7.5 5v5" />
      </svg>
    ),
  },
  {
    key: 'deploys',
    path: '/deploys',
    i18n: 'nav.deploys',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7.5 1v10M4 8l3.5 3.5L11 8" />
        <path d="M2 13h11" />
      </svg>
    ),
  },
  {
    key: 'agentes',
    path: '/agentes',
    i18n: 'nav.agents',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="5" r="2.5" />
        <circle cx="10" cy="10" r="2.5" />
        <path d="M7 3l1 4" />
      </svg>
    ),
  },
  {
    key: 'logs',
    path: '/logs',
    i18n: 'nav.logs',
    badge: '2',
    badgeRed: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 3h11M2 6h8M2 9h11M2 12h6" />
      </svg>
    ),
  },
  {
    key: 'automacoes',
    path: '/automacoes',
    i18n: 'nav.automations',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 1v5l4 2-4 2v5" />
        <path d="M9 4h4M9 7.5h4M9 11h4" />
      </svg>
    ),
  },
  {
    key: 'marketplace',
    path: '/marketplace',
    i18n: 'nav.marketplace',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 5l2-4h9l2 4" />
        <rect x="1" y="5" width="13" height="9" rx="1" />
        <path d="M5.5 5v2a2 2 0 004 0V5" />
      </svg>
    ),
  },
  {
    key: 'playground',
    path: '/playground',
    i18n: 'nav.playground',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4l3 3.5L4 11" />
        <path d="M8 11h4" />
      </svg>
    ),
  },
  {
    key: 'status',
    path: '/status',
    i18n: 'nav.status',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7.5" cy="7.5" r="6" />
        <path d="M4.5 7.5l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'configuracoes',
    path: '/configuracoes',
    i18n: 'nav.settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7.5" cy="7.5" r="2" />
        <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M2.9 12.1l1.4-1.4M10.7 4.3l1.4-1.4" />
      </svg>
    ),
  },
]

const favorites = [
  { name: 'Landing Page v2', path: '/projetos/landing-page-v2', color: '#22c55e' },
  { name: 'API Gateway', path: '/projetos/api-gateway', color: '#3b82f6' },
  { name: 'Design System', path: '/projetos/design-system', color: '#c026d3' },
]

const agents = [
  { name: 'Codex', initials: 'CX', color: '#3b82f6', online: true },
  { name: 'Sentinel', initials: 'SN', color: '#22c55e', online: true },
  { name: 'Reviewer', initials: 'RV', color: '#8b5cf6', online: false },
]

type Lang = 'pt-BR' | 'en' | 'es'

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth()
  const { roleName } = useTheme()
  const { t, lang, setLang } = useTranslation()

  return (
    <aside className={clsx(styles.side, mobileOpen && styles.mobileOpen)}>
      <div className={styles.sideLogo}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect width="18" height="18" rx="4" fill="currentColor" />
          <path d="M5 6l4 3-4 3" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        NOMMAND
        <span className={styles.badge}>BETA</span>
      </div>

      <div className={styles.sideSection}>
        <div className={styles.sideSectionLabel}>{t('sidebar.workspace')}</div>
        <nav className={styles.sideNav}>
          {navItems.map(item => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                clsx(styles.si, isActive && styles.siActive)
              }
              onClick={onCloseMobile}
            >
              {item.icon}
              {item.i18n === 'nav.projects'
                ? t(item.i18n, { role: roleName })
                : t(item.i18n)}
              {item.badge && (
                <span className={clsx(styles.siBadge, item.badgeRed && styles.siBadgeRed)}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={styles.sideSection}>
        <div className={styles.sideSectionLabel}>{t('sidebar.favorites')}</div>
        <nav className={styles.sideNav}>
          {favorites.map(fav => (
            <NavLink
              key={fav.path}
              to={fav.path}
              className={({ isActive }) =>
                clsx(styles.si, isActive && styles.siActive)
              }
              onClick={onCloseMobile}
            >
              <span className={styles.favColor} style={{ background: fav.color }} />
              {fav.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={styles.sideSection}>
        <div className={styles.sideSectionLabel}>{t('sidebar.agents')}</div>
        <nav className={styles.sideNav}>
          {agents.map(agent => (
            <div key={agent.name} className={styles.si}>
              <span className={styles.teamAv} style={{ background: agent.color }}>
                {agent.initials}
              </span>
              {agent.name}
              <span className={agent.online ? styles.onlineDot : styles.offlineDot} />
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.sideSection}>
        <div className={styles.langSwitcher}>
          {(['pt-BR', 'en', 'es'] as Lang[]).map(l => (
            <button
              key={l}
              className={clsx(styles.langBtn, lang === l && styles.langBtnActive)}
              onClick={() => setLang(l)}
            >
              {l === 'pt-BR' ? 'PT' : l === 'en' ? 'EN' : 'ES'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sideBottom}>
        <div className={styles.sideUpgrade}>
          <span className={styles.upgradeIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--neon)" strokeWidth="1.5">
              <path d="M8 2l2 5h4l-3.5 3 1.5 5L8 12 3.5 15 5 10 1.5 7h4z" />
            </svg>
          </span>
          <div>
            <span className={styles.upgradeStrong}>{t('sidebar.upgradePro')}</span>
            <span className={styles.upgradeSpan}>{t('sidebar.unlimitedDeploys')}</span>
          </div>
        </div>

        <div className={styles.avatarRow}>
          <NavLink to="/perfil" className={styles.avatar}>
            {user.userName.charAt(0).toUpperCase()}
          </NavLink>
          <div className={styles.avatarInfo}>
            <span className={styles.avatarName}>{user.userName}</span>
            <span className={styles.avatarRole}>{roleName}</span>
          </div>
          <NavLink to="/configuracoes" className={styles.settingsBtn} onClick={onCloseMobile}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="2" />
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.8 2.8l1 1M10.2 10.2l1 1M2.8 11.2l1-1M10.2 3.8l1-1" />
            </svg>
          </NavLink>
        </div>
      </div>
    </aside>
  )
}
