import { useTheme } from '@/hooks/useTheme.ts'
import styles from './Header.module.css'

interface HeaderProps {
  title?: string
  subtitle?: string
  onOpenCmdk: () => void
  onToggleNotif: () => void
  onToggleMobile: () => void
  notifCount?: number
}

export function Header({
  title,
  subtitle,
  onOpenCmdk,
  onToggleNotif,
  onToggleMobile,
  notifCount = 0,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={styles.dashHeader}>
      <div>
        {title && <h1>{title}</h1>}
        {subtitle && <p className={styles.dashSub}>{subtitle}</p>}
      </div>
      <div className={styles.dashHeaderActions}>
        <button className={styles.mobileMenuBtn} onClick={onToggleMobile}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h12M3 9h12M3 13h12" />
          </svg>
        </button>

        <button
          className={styles.cmdkTrigger}
          id="btn-cmdk"
          onClick={onOpenCmdk}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" />
          </svg>
          <kbd>Ctrl+K</kbd>
        </button>

        <button
          className={styles.dashNotifBtn}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="3.5" />
              <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13.5 8.5a5.5 5.5 0 01-6-6 5.5 5.5 0 106 6z" />
            </svg>
          )}
        </button>

        <button
          className={styles.dashNotifBtn}
          id="notif-btn"
          onClick={onToggleNotif}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6a4 4 0 018 0c0 4 2 5 2 5H2s2-1 2-5" />
            <path d="M6.5 13.5a1.5 1.5 0 003 0" />
          </svg>
          {notifCount > 0 && (
            <span className={styles.notifBadge}>{notifCount}</span>
          )}
        </button>
      </div>
    </header>
  )
}
