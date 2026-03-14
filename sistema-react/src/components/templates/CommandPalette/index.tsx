import { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './CommandPalette.module.css'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface CmdItem {
  id: string
  label: string
  icon: string
  shortcut?: string
  action: () => void
  group: string
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [focusIdx, setFocusIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const listboxId = useId()

  const items: CmdItem[] = useMemo(() => [
    {
      id: 'gen-ui',
      label: t('cmdk.generateUi'),
      icon: '\u2728',
      shortcut: '',
      group: t('cmdk.quickActions'),
      action: () => { navigate('/nommand-ai'); onClose() },
    },
    {
      id: 'deploy-prod',
      label: t('cmdk.deployProd'),
      icon: '\u{1F680}',
      shortcut: 'Ctrl+D',
      group: t('cmdk.quickActions'),
      action: () => { navigate('/deploys'); onClose() },
    },
    {
      id: 'view-analytics',
      label: t('cmdk.viewAnalytics'),
      icon: '\u{1F4CA}',
      shortcut: '',
      group: t('cmdk.quickActions'),
      action: () => { navigate('/analytics'); onClose() },
    },
    {
      id: 'nav-panorama',
      label: 'Panorama',
      icon: '\u{1F3E0}',
      shortcut: 'G P',
      group: t('cmdk.navigation'),
      action: () => { navigate('/panorama'); onClose() },
    },
    {
      id: 'nav-projetos',
      label: 'Projetos',
      icon: '\u{1F4C1}',
      shortcut: 'G J',
      group: t('cmdk.navigation'),
      action: () => { navigate('/projetos'); onClose() },
    },
    {
      id: 'nav-inbox',
      label: 'Inbox',
      icon: '\u{1F4E8}',
      shortcut: 'G I',
      group: t('cmdk.navigation'),
      action: () => { navigate('/inbox'); onClose() },
    },
    {
      id: 'open-ai',
      label: t('cmdk.openAiChat'),
      icon: '\u{1F916}',
      shortcut: '',
      group: t('cmdk.navigation'),
      action: () => { navigate('/nommand-ai'); onClose() },
    },
    {
      id: 'open-playground',
      label: t('cmdk.openPlayground'),
      icon: '\u{1F3AE}',
      shortcut: '',
      group: t('cmdk.navigation'),
      action: () => { navigate('/playground'); onClose() },
    },
    {
      id: 'view-logs',
      label: t('cmdk.viewLogs'),
      icon: '\u{1F4DD}',
      shortcut: 'Ctrl+L',
      group: t('cmdk.navigation'),
      action: () => { navigate('/logs'); onClose() },
    },
    {
      id: 'recent-1',
      label: 'src/components/Dashboard.tsx',
      icon: '\u{1F4C4}',
      group: t('cmdk.recentFiles'),
      action: () => { navigate('/playground'); onClose() },
    },
    {
      id: 'recent-2',
      label: 'src/hooks/useAuth.ts',
      icon: '\u{1F4C4}',
      group: t('cmdk.recentFiles'),
      action: () => { navigate('/playground'); onClose() },
    },
    {
      id: 'recent-3',
      label: 'package.json',
      icon: '\u{1F4C4}',
      group: t('cmdk.recentFiles'),
      action: () => { navigate('/playground'); onClose() },
    },
  ], [t, navigate, onClose])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(i => i.label.toLowerCase().includes(q))
  }, [items, search])

  const groups = useMemo(() => {
    const map = new Map<string, CmdItem[]>()
    for (const item of filtered) {
      const list = map.get(item.group) || []
      list.push(item)
      map.set(item.group, list)
    }
    return map
  }, [filtered])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      setSearch('')
      setFocusIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      return () => {
        previousFocusRef.current?.focus()
      }
    }
  }, [open])

  useEffect(() => {
    setFocusIdx(0)
  }, [search])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIdx(prev => Math.min(prev + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIdx(prev => Math.max(prev - 1, 0))
    }
    if (e.key === 'Enter' && filtered[focusIdx]) {
      e.preventDefault()
      filtered[focusIdx].action()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
    }
  }, [onClose, filtered, focusIdx])

  useEffect(() => {
    if (!open) return
    function handleGlobalKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
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
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [open, onClose])

  const activeDescendant = filtered[focusIdx]?.id ?? undefined

  let flatIdx = -1

  return (
    <div
      className={clsx(styles.cmdkOverlay, open && styles.cmdkOverlayOpen)}
      onClick={onClose}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('cmdk.placeholder')}
        className={styles.cmdkBox}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.cmdkTop}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={filtered.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            className={styles.cmdkInput}
            placeholder={t('cmdk.placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div
          id={listboxId}
          role="listbox"
          aria-label={t('cmdk.placeholder')}
          className={styles.cmdkList}
        >
          {Array.from(groups.entries()).map(([groupName, groupItems]) => (
            <div key={groupName} role="group" aria-label={groupName}>
              <div className={styles.cmdkGroup}>{groupName}</div>
              {groupItems.map(item => {
                flatIdx++
                const idx = flatIdx
                return (
                  <div
                    key={item.id}
                    id={item.id}
                    role="option"
                    aria-selected={idx === focusIdx}
                    className={clsx(styles.cmdkItem, idx === focusIdx && styles.cmdkItemFocused)}
                    onClick={item.action}
                    onMouseEnter={() => setFocusIdx(idx)}
                    tabIndex={-1}
                  >
                    <span className={styles.cmdkIcon}>{item.icon}</span>
                    {item.label}
                    {item.shortcut && (
                      <span className={styles.cmdkShortcut}>{item.shortcut}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.cmdkGroup} style={{ padding: '1rem', textAlign: 'center' }}>
              {t('common.noResults')}
            </div>
          )}
        </div>
        <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
          {filtered.length > 0
            ? t('cmdk.resultsCount', { count: filtered.length })
            : t('cmdk.noResults')}
        </div>
      </div>
    </div>
  )
}
