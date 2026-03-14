import { useEffect, useCallback, useRef, useId } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './ConfirmDialog.module.css'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  className?: string
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger, className }: ConfirmDialogProps) {
  const { t } = useTranslation()
  const boxRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descId = useId()

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
      return
    }
    if (e.key === 'Tab' && boxRef.current) {
      const focusable = boxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [onCancel])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', handleKey)
      requestAnimationFrame(() => {
        confirmRef.current?.focus()
      })
      return () => {
        document.removeEventListener('keydown', handleKey)
        previousFocusRef.current?.focus()
      }
    }
  }, [open, handleKey])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={boxRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={clsx(styles.box, className)}
        onClick={e => e.stopPropagation()}
      >
        <div id={titleId} className={styles.title}>{title}</div>
        <div id={descId} className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>{t('common.cancel')}</button>
          <button
            ref={confirmRef}
            className={clsx(styles.btnConfirm, danger && styles.danger)}
            onClick={onConfirm}
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
