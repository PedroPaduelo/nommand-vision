import { useState, useCallback } from 'react'
import clsx from 'clsx'
import type { KeyboardEvent } from 'react'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Playground.module.css'

interface CodeLine {
  text: string
  diff?: 'added' | 'removed'
}

interface Props {
  openTabs: string[]
  activeFile: string
  codeLines: CodeLine[]
  lang: string
  onTabClick: (name: string) => void
  onTabClose: (name: string) => void
  onAiSubmit: (prompt: string) => void
  aiProcessing: boolean
  fileIcons: Record<string, string>
}

export default function EditorPanel({ openTabs, activeFile, codeLines, lang, onTabClick, onTabClose, onAiSubmit, aiProcessing, fileIcons }: Props) {
  const { t } = useTranslation()
  const [aiInput, setAiInput] = useState('')

  const handleAiSend = useCallback(() => {
    if (!aiInput.trim() || aiProcessing) return
    onAiSubmit(aiInput.trim())
    setAiInput('')
  }, [aiInput, aiProcessing, onAiSubmit])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAiSend()
  }, [handleAiSend])

  return (
    <div className={css.pgEditorPanel}>
      <div className={css.pgEditorTabs}>
        {openTabs.map(name => (
          <button
            key={name}
            className={clsx(css.pgEditorTab, name === activeFile && css.pgEditorTabActive)}
            onClick={() => onTabClick(name)}
            type="button"
          >
            <span className={css.pgFileIcon} style={{ fontSize: '.65rem' }}>{fileIcons[name] || '\ud83d\udcc4'}</span>
            {name}
            {openTabs.length > 1 && (
              <button
                className={css.pgTabClose}
                onClick={e => { e.stopPropagation(); onTabClose(name) }}
                type="button"
              >
                x
              </button>
            )}
          </button>
        ))}
      </div>
      <div className={css.pgEditorBody}>
        {codeLines.map((line, i) => {
          return (
            <div key={i} className={clsx(css.pgCodeLine, line.diff === 'added' && css.pgCodeLineAdded, line.diff === 'removed' && css.pgCodeLineRemoved)}>
              <span className={css.pgLineNum}>{i + 1}</span>
              <span className={css.pgCode}>{line.text}</span>
            </div>
          )
        })}
      </div>
      <div className={css.pgAiBar}>
        <div className={css.pgAiAvatar}>AI</div>
        <input
          type="text"
          className={css.pgAiInput}
          placeholder={t('playground.aiPlaceholder')}
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={aiProcessing}
        />
        <button
          className={css.pgAiBtn}
          onClick={handleAiSend}
          disabled={aiProcessing}
          type="button"
        >
          {aiProcessing ? '...' : t('common.send')}
        </button>
      </div>
      <div className={css.pgEditorFooter}>
        <span>{lang}</span>
        <span>{t('playground.editorPosition', { line: String(codeLines.length), col: '1' })}</span>
      </div>
    </div>
  )
}

export type { CodeLine }
