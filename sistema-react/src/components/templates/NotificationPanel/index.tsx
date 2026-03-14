import { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { getNotifications, clearAll } from '@/services/notifications.service.ts'
import type { Notification } from '@/types/index.ts'
import styles from './NotificationPanel.module.css'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

function getIconColorClass(color: string): string {
  if (color.includes('22c55e') || color.includes('16a34a')) return styles.notifIconGreen
  if (color.includes('eab308') || color.includes('ca8a04')) return styles.notifIconYellow
  return styles.notifIconBlue
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (open) {
      getNotifications().then(setNotifications)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleClearAll = useCallback(async () => {
    await clearAll()
    const updated = await getNotifications()
    setNotifications(updated)
  }, [])

  return (
    <div className={clsx(styles.notifPanel, open && styles.notifPanelOpen)}>
      <div className={styles.notifHeader}>
        <strong>{t('notif.title')}</strong>
        <button className={styles.notifClear} onClick={handleClearAll}>
          {t('notif.clearAll')}
        </button>
        <button className={styles.notifClose} onClick={onClose}>{'\u2715'}</button>
      </div>
      <div className={styles.notifList}>
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={clsx(styles.notifItem, notif.unread && styles.notifItemUnread)}
          >
            <div className={clsx(styles.notifIcon, getIconColorClass(notif.iconColor))}>
              {notif.icon}
            </div>
            <div>
              <span className={styles.notifItemTitle}>{notif.title}</span>
              <span className={styles.notifItemDesc}>{notif.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
