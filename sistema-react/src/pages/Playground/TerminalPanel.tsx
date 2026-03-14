import { useState, useRef, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import type { KeyboardEvent } from 'react'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Playground.module.css'

interface TermLine {
  html: string
}

interface Props {
  lines: TermLine[]
  onCommand: (cmd: string) => void
}

const TERM_TAB_KEYS = ['terminal', 'output', 'problems'] as const

export default function TerminalPanel({ lines, onCommand }: Props) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('terminal')
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [lines])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Enter') return
    const cmd = input.trim()
    if (!cmd) return
    setInput('')
    onCommand(cmd)
  }, [input, onCommand])

  return (
    <div className={css.pgTerminal}>
      <div className={css.pgTermHeader}>
        <div className={css.pgTermTabs}>
          {TERM_TAB_KEYS.map(key => (
            <button
              key={key}
              className={clsx(css.pgTermTab, activeTab === key && css.pgTermTabActive)}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              {t(`playground.tab.${key}`)}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '.6rem', color: '#333' }}>zsh</span>
      </div>
      <div className={css.pgTermBody} ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={css.pgTLine} dangerouslySetInnerHTML={{ __html: sanitizeHtml(l.html) }} />
        ))}
      </div>
      <div className={css.pgTermInputLine}>
        <span className={css.pgTermPrompt}>~/project $</span>
        <input
          type="text"
          className={css.pgTermInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}

export type { TermLine }
