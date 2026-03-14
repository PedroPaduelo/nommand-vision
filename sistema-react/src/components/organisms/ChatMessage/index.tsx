import type { ReactNode } from 'react'
import clsx from 'clsx'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import styles from './ChatMessage.module.css'

interface ChatMessageProps {
  role: 'user' | 'bot'
  content: string
  avatar?: ReactNode
  typing?: boolean
  className?: string
}

export function ChatMessage({ role, content, avatar, typing, className }: ChatMessageProps) {
  const defaultAvatar = role === 'user' ? 'U' : 'N'

  return (
    <div className={clsx(styles.message, styles[role], className)}>
      <div className={styles.avatar}>
        {avatar ?? defaultAvatar}
      </div>
      <div className={styles.bubble}>
        {typing ? (
          <span className={styles.typingText}>
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
            <span className={styles.cursor} />
          </span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
        )}
      </div>
    </div>
  )
}
