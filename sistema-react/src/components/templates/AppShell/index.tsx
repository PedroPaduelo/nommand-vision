import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { Sidebar } from '@/components/templates/Sidebar/index.tsx'
import { Header } from '@/components/templates/Header/index.tsx'
import { CommandPalette } from '@/components/templates/CommandPalette/index.tsx'
import { NotificationPanel } from '@/components/templates/NotificationPanel/index.tsx'
import { TourOverlay } from '@/components/templates/TourOverlay/index.tsx'
import { Toast } from '@/components/templates/AppShell/Toast.tsx'
import { useToast } from '@/hooks/useToast.ts'
import { useNotifications } from '@/hooks/queries/useNotificationQueries.ts'
import styles from './AppShell.module.css'

export default function AppShell() {
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toasts, remove } = useToast()
  const { data: notifications } = useNotifications()
  const notifCount = notifications?.filter(n => n.unread).length ?? 0

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdkOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [])

  const openCmdk = useCallback(() => {
    setNotifOpen(false)
    setCmdkOpen(true)
  }, [])

  const closeCmdk = useCallback(() => setCmdkOpen(false), [])

  const toggleNotif = useCallback(() => {
    setCmdkOpen(false)
    setNotifOpen(prev => !prev)
  }, [])

  const closeNotif = useCallback(() => setNotifOpen(false), [])

  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className={styles.dashboard}>
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={closeMobile} />

      <div
        className={clsx(styles.mobileOverlay, mobileOpen && styles.mobileOverlayShow)}
        onClick={closeMobile}
      />

      <div className={styles.dashBody}>
        <Header
          onOpenCmdk={openCmdk}
          onToggleNotif={toggleNotif}
          onToggleMobile={toggleMobile}
          notifCount={notifCount}
        />
        <div className={styles.scrollArea}>
          <Outlet />
        </div>
      </div>

      <CommandPalette open={cmdkOpen} onClose={closeCmdk} />
      <NotificationPanel open={notifOpen} onClose={closeNotif} />
      <TourOverlay />
      <Toast toasts={toasts} onRemove={remove} />
    </div>
  )
}
