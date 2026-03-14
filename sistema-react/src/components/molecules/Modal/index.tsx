import { useEffect, useCallback, useRef, useId } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import styles from './Modal.module.css'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: string
  className?: string
}

export function Modal({ open, onClose, title, children, width, className }: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
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
  }, [onClose])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', handleKey)
      requestAnimationFrame(() => {
        if (boxRef.current) {
          const first = boxRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
          if (first) first.focus()
          else boxRef.current.focus()
        }
      })
      return () => {
        document.removeEventListener('keydown', handleKey)
        previousFocusRef.current?.focus()
      }
    }
  }, [open, handleKey])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={clsx(styles.box, className)}
        style={width ? { maxWidth: width } : undefined}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <span id={titleId} className={styles.title}>{title}</span>
            <button className={styles.close} onClick={onClose}>ESC</button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
