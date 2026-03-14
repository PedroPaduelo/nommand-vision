import { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'
import type { Role } from '@/types/index.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import css from './Onboarding.module.css'

const STACK_DB: Record<Role, string[]> = {
  Frontend: ['React', 'Next.js', 'TailwindCSS', 'Framer Motion', 'Zustand', 'Vite', 'TypeScript'],
  Backend: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Go', 'GraphQL', 'Kubernetes'],
  Design: ['Figma Tokens', 'Storybook', 'Framer', 'Spline 3D', 'Radix UI', 'CSS Modules'],
  Data: ['Python', 'Pandas', 'Airflow', 'Snowflake', 'dbt', 'PyTorch', 'Jupyter'],
}

interface ChatViewProps {
  role: Role
  stack: string[]
  cpuLevel: number
  onUpdateStack: (stack: string[]) => void
  onUpdateCpu: (cpu: number) => void
  onDeploy: () => void
}

function MsgAvatar() {
  return (
    <div className={css.chatMsgAv}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 22h20L12 2Z" fill="currentColor" />
      </svg>
    </div>
  )
}

export default function ChatView({ role, stack, cpuLevel, onUpdateStack, onUpdateCpu, onDeploy }: ChatViewProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<{ id: number; text: string; typing: boolean }[]>([])
  const [showWidget, setShowWidget] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    const tags = STACK_DB[role] || STACK_DB.Frontend
    const initialStack = tags.slice(0, 3)
    onUpdateStack(initialStack)

    setMessages([])
    setShowWidget(false)

    function waitC(ms: number) {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => cancelled ? reject(new Error('cancelled')) : resolve(), ms)
      })
    }

    async function typeMessageInPlace(id: number, text: string, speed: number) {
      let typed = ''
      for (const char of text) {
        if (cancelled) return
        typed += char
        const current = typed
        setMessages(prev => prev.map(m => m.id === id ? { ...m, text: current } : m))
        await waitC(speed)
      }
    }

    async function runChat() {
      try {
        const msg1Text = t('onboarding.chatMsg1', { role: role.toUpperCase() })
        setMessages([{ id: 1, text: '', typing: true }])
        await typeMessageInPlace(1, msg1Text, 18)
        if (cancelled) return
        setMessages(prev => prev.map(m => m.id === 1 ? { ...m, text: msg1Text, typing: false } : m))
        await waitC(300)

        const msg2Text = t('onboarding.chatMsg2')
        setMessages(prev => [...prev, { id: 2, text: '', typing: true }])
        await typeMessageInPlace(2, msg2Text, 16)
        if (cancelled) return
        setMessages(prev => prev.map(m => m.id === 2 ? { ...m, text: msg2Text, typing: false } : m))
        await waitC(200)

        const msg3Text = t('onboarding.chatMsg3')
        setMessages(prev => [...prev, { id: 3, text: '', typing: true }])
        await typeMessageInPlace(3, msg3Text, 14)
        if (cancelled) return
        setMessages(prev => prev.map(m => m.id === 3 ? { ...m, text: msg3Text, typing: false } : m))
        await waitC(200)

        if (!cancelled) setShowWidget(true)
      } catch {
        // cancelled
      }
    }

    runChat()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        onDeploy()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onDeploy])

  const toggleTag = useCallback((tag: string) => {
    onUpdateStack(
      stack.includes(tag) ? stack.filter(s => s !== tag) : [...stack, tag]
    )
  }, [stack, onUpdateStack])

  const tags = STACK_DB[role] || STACK_DB.Frontend

  return (
    <div className={css.chatContainer}>
      <div className={css.chatHeader}>
        <div className={css.chatHeaderLeft}>
          <div className={css.agentAvatar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 22h20L12 2Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className={css.agentName}>Nommand Core Agent</span>
            <span className={css.agentModel}>nommand-v3-turbo</span>
          </div>
        </div>
        <div className={css.pulseDot} />
      </div>

      <div className={css.chatThread} ref={threadRef}>
        {messages.map(msg => (
          <div key={msg.id} className={css.chatMsg}>
            <MsgAvatar />
            <div className={css.msgText}>
              {msg.id === 1 && !msg.typing ? (
                <span dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(t('onboarding.chatMsg1', { role: '<strong>' + role.toUpperCase() + '</strong>' }))
                }} />
              ) : (
                <span>{msg.text}</span>
              )}
              {msg.typing && <span className={css.typing} />}
            </div>
          </div>
        ))}
      </div>

      {showWidget && (
        <div className={css.genWg}>
          <span
            className={css.wgLabel}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(t('onboarding.stackLabel')) }}
          />
          <div className={css.tagsPick}>
            {tags.map(tag => (
              <button
                key={tag}
                className={clsx(css.genTag, stack.includes(tag) && css.genTagOn)}
                onClick={() => toggleTag(tag)}
                tabIndex={0}
              >
                {tag}
              </button>
            ))}
          </div>

          <span className={css.wgLabel} style={{ marginTop: '1.2rem' }}>
            {t('onboarding.processingVolume')}
          </span>
          <input
            type="range"
            min={1}
            max={5}
            value={cpuLevel}
            className={css.rng}
            onChange={e => onUpdateCpu(Number(e.target.value))}
          />
          <div className={css.rngLabels}>
            <span>Micro</span>
            <span>Small</span>
            <span>Medium</span>
            <span>Pro</span>
            <span>Ultra</span>
          </div>

          <div className={css.wgFoot}>
            <button className={css.btnPrimary} onClick={onDeploy}>
              <span className={css.btnGlow} />
              {t('onboarding.projectEnv')} <kbd>&#x2318; Enter</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
