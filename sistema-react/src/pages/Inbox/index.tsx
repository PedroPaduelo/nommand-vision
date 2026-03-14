import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useToast } from '@/hooks/useToast.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import {
  useMessages,
  useMarkRead,
  useMarkUnread,
  useArchiveMessage,
  useDeleteMessage,
} from '@/hooks/queries/useInboxQueries.ts'
import type { InboxMessage } from '@/types/index.ts'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import styles from './Inbox.module.css'

type FilterKey = 'all' | 'unread' | 'mention' | 'deploy' | 'ai'

const TAG_STYLES: Record<string, string> = {
  deploy: styles.tagDeploy,
  review: styles.tagReview,
  ai: styles.tagAi,
  alert: styles.tagAlert,
  mention: styles.tagMention,
}

export default function Inbox() {
  const { t } = useTranslation()
  const toast = useToast()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [replySent, setReplySent] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showList, setShowList] = useState(true)

  const isMobile = () => window.innerWidth < 768

  const searchRef = useRef<HTMLInputElement>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  const { data: allMessages = [] } = useMessages()
  const markReadMutation = useMarkRead()
  const markUnreadMutation = useMarkUnread()
  const archiveMutation = useArchiveMessage()
  const deleteMutation = useDeleteMessage()

  const counts = useMemo(() => ({
    all: allMessages.length,
    unread: allMessages.filter(m => m.unread).length,
    mention: allMessages.filter(m => m.filters.includes('mention')).length,
    deploy: allMessages.filter(m => m.filters.includes('deploy')).length,
    ai: allMessages.filter(m => m.filters.includes('ai')).length,
  }), [allMessages])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allMessages.filter(m => {
      const matchFilter = activeFilter === 'all'
        || (activeFilter === 'unread' ? m.unread : m.filters.includes(activeFilter))
      const matchSearch = !q
        || m.subject.toLowerCase().includes(q)
        || m.from.toLowerCase().includes(q)
        || m.preview.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [allMessages, activeFilter, search])

  const selectedMsg = useMemo(
    () => allMessages.find(m => m.id === selectedId) ?? null,
    [allMessages, selectedId]
  )

  const selectedIndex = useMemo(
    () => filtered.findIndex(m => m.id === selectedId),
    [filtered, selectedId]
  )

  const selectMessage = useCallback((msg: InboxMessage) => {
    setSelectedId(msg.id)
    setReplySent(false)
    setReplyText('')
    if (msg.unread) {
      markReadMutation.mutate(msg.id)
    }
    if (isMobile()) {
      setShowList(false)
    }
  }, [markReadMutation])

  const handleArchive = useCallback((id: number) => {
    archiveMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t('inbox.archived'))
        if (selectedId === id) setSelectedId(null)
      },
    })
  }, [archiveMutation, selectedId, toast])

  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.error(t('inbox.deleted'))
        if (selectedId === id) setSelectedId(null)
      },
    })
  }, [deleteMutation, selectedId, toast])

  const handleToggleRead = useCallback((id: number) => {
    const msg = allMessages.find(m => m.id === id)
    if (!msg) return
    if (msg.unread) {
      markReadMutation.mutate(id)
    } else {
      markUnreadMutation.mutate(id)
    }
  }, [allMessages, markReadMutation, markUnreadMutation])

  const handleReply = useCallback(() => {
    if (!replyText.trim() || !selectedMsg) return
    setReplySent(true)
    toast.success(t('inbox.replySent'))
  }, [replyText, selectedMsg, toast])

  const navigateNext = useCallback(() => {
    if (selectedIndex < filtered.length - 1) {
      selectMessage(filtered[selectedIndex + 1])
    }
  }, [selectedIndex, filtered, selectMessage])

  const navigatePrev = useCallback(() => {
    if (selectedIndex > 0) {
      selectMessage(filtered[selectedIndex - 1])
    }
  }, [selectedIndex, filtered, selectMessage])

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          target.blur()
        }
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        navigateNext()
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        navigatePrev()
      } else if (e.key === 'Enter' && selectedIndex === -1 && filtered.length > 0) {
        selectMessage(filtered[0])
      }

      if (selectedId) {
        if (e.key === 'e') handleArchive(selectedId)
        else if (e.key === '#') handleDelete(selectedId)
        else if (e.key === 'r') handleToggleRead(selectedId)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navigateNext, navigatePrev, selectedId, selectedIndex, filtered, selectMessage, handleArchive, handleDelete, handleToggleRead])

  const handleBackToList = useCallback(() => {
    setShowList(true)
  }, [])

  // Ctrl+Enter in reply
  const handleReplyKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleReply()
    }
  }, [handleReply])

  return (
    <div className={styles.layout}>
      {/* Left: sidebar */}
      <div className={clsx(styles.sidebar, showList && styles.sidebarShow)}>
        {/* Search */}
        <div className={styles.searchBox}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>{'\u{1F50D}'}</span>
            <input
              ref={searchRef}
              className={styles.searchInput}
              type="text"
              placeholder={t('inbox.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className={styles.searchShortcut}>/</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {([
            { key: 'all' as FilterKey, label: t('inbox.filterAll'), icon: '\u{1F4E8}' },
            { key: 'unread' as FilterKey, label: t('inbox.filterUnread'), icon: '\u{1F4EC}' },
            { key: 'mention' as FilterKey, label: t('inbox.filterMentions'), icon: '\u{1F465}' },
            { key: 'deploy' as FilterKey, label: t('inbox.filterDeploys'), icon: '\u2705' },
            { key: 'ai' as FilterKey, label: t('inbox.filterAi'), icon: '\u{1F916}' },
          ]).map(f => (
            <button
              key={f.key}
              className={clsx(styles.filterBtn, activeFilter === f.key && styles.filterBtnActive)}
              onClick={() => setActiveFilter(f.key)}
            >
              <span>{f.icon}</span>
              {f.label}
              <span className={styles.filterBadge}>{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* Message list */}
        <div className={styles.messageList}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{'\u{1F50D}'}</div>
              <div className={styles.emptyTitle}>{t('inbox.noMessages')}</div>
              <div className={styles.emptyDesc}>
                {search ? t('inbox.tryOtherTerms') : t('inbox.nothingHere')}
              </div>
            </div>
          ) : (
            filtered.map(m => {
              const isActive = m.id === selectedId
              const itemClasses = clsx(
                styles.msgItem,
                isActive && styles.msgItemActive,
                m.unread && styles.msgItemUnread,
              )

              return (
                <div
                  key={m.id}
                  className={itemClasses}
                  onClick={() => selectMessage(m)}
                >
                  <div className={styles.msgAvatar} style={{ background: m.av }}>
                    {m.initials}
                    {m.online && <span className={styles.onlineDot} />}
                  </div>
                  <div className={styles.msgContent}>
                    <div className={styles.msgHeader}>
                      <span className={clsx(styles.msgFrom, m.unread && styles.msgFromUnread)}>
                        {m.from}
                      </span>
                      <span className={styles.msgTime}>{m.time.includes('h') ? m.time : m.time + ` ${t('inbox.min')}`}</span>
                    </div>
                    <div className={clsx(styles.msgSubject, m.unread && styles.msgSubjectUnread)}>
                      {m.subject}
                    </div>
                    <div className={styles.msgPreview}>{m.preview}</div>
                    <div className={styles.msgFooter}>
                      <span className={clsx(styles.msgTag, TAG_STYLES[m.tag])}>
                        {m.tagLabel}
                      </span>
                      {m.attachment && (
                        <span className={styles.msgAttachment}>{'\u{1F4C4}'} 1</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.msgActions}>
                    <button
                      className={clsx(styles.actionBtn, styles.actionArchive)}
                      title={`${t('inbox.archive')} (e)`}
                      onClick={e => { e.stopPropagation(); handleArchive(m.id) }}
                    >
                      {'\u{1F4BE}'}
                    </button>
                    <button
                      className={clsx(styles.actionBtn, styles.actionRead)}
                      title={`${t('inbox.toggleRead')} (r)`}
                      onClick={e => { e.stopPropagation(); handleToggleRead(m.id) }}
                    >
                      {m.unread ? '\u{1F4EC}' : '\u{1F4E9}'}
                    </button>
                    <button
                      className={clsx(styles.actionBtn, styles.actionDelete)}
                      title={`${t('inbox.deleteAction')} (#)`}
                      onClick={e => { e.stopPropagation(); handleDelete(m.id) }}
                    >
                      {'\u{1F5D1}'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right: detail */}
      <div className={clsx(styles.detail, showList && styles.detailHidden)}>
        {!selectedMsg ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{'\u{1F4E9}'}</div>
            <div className={styles.emptyTitle}>{t('inbox.selectMessage')}</div>
            <div className={styles.emptyDesc}>{t('inbox.navigateHint')}</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.detailHeader}>
              <button className={styles.backBtn} onClick={handleBackToList}>
                {'\u2190'} {t('inbox.back')}
              </button>
              <div className={styles.detailSubject}>{selectedMsg.subject}</div>
              <div className={styles.detailMeta}>
                <div className={styles.detailAvatar} style={{ background: selectedMsg.av }}>
                  {selectedMsg.initials}
                </div>
                <div className={styles.detailFrom}>
                  <div className={styles.detailName}>{selectedMsg.from}</div>
                  <div className={styles.detailEmail}>{selectedMsg.email}</div>
                </div>
                <span className={styles.detailTime}>{selectedMsg.time.includes('h') ? selectedMsg.time : selectedMsg.time + ` ${t('inbox.minAgo')}`}</span>
                <span className={clsx(styles.msgTag, TAG_STYLES[selectedMsg.tag])}>
                  {selectedMsg.tagLabel}
                </span>
              </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <button
                className={clsx(styles.toolBtn, styles.toolBtnPrimary)}
                onClick={() => replyRef.current?.focus()}
              >
                {'\u{279C}'} {t('inbox.reply')}
              </button>
              <button className={styles.toolBtn} onClick={() => handleArchive(selectedMsg.id)}>
                {'\u{1F4BE}'} {t('inbox.archive')}
              </button>
              <button className={styles.toolBtn} onClick={() => handleDelete(selectedMsg.id)}>
                {'\u{1F5D1}'} {t('inbox.deleteAction')}
              </button>
              <button className={styles.toolBtn} onClick={navigateNext}>
                {'\u25B6'} {t('inbox.next')} <span style={{ opacity: .5, fontSize: '.6rem' }}>(j)</span>
              </button>
              <div className={styles.toolSpacer} />
              <button
                className={styles.toolBtn}
                onClick={() => handleToggleRead(selectedMsg.id)}
              >
                {selectedMsg.unread
                  ? `\u{1F4E9} ${t('inbox.markRead')}`
                  : `\u{1F4EC} ${t('inbox.markUnread')}`}
              </button>
            </div>

            {/* Body */}
            <div
              className={styles.detailBody}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedMsg.body) }}
            />

            {/* Reply */}
            <div className={styles.replyBox}>
              {replySent ? (
                <div className={styles.replySent}>
                  <div className={styles.replySentIcon}>{'\u2705'}</div>
                  <div>{t('inbox.replySentTo', { name: selectedMsg.from })}</div>
                </div>
              ) : (
                <div className={styles.replyWrapper}>
                  <textarea
                    ref={replyRef}
                    className={styles.replyTextarea}
                    placeholder={t('inbox.replyPlaceholder')}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                  />
                  <div className={styles.replyToolbar}>
                    <div />
                    <button className={styles.replySendBtn} onClick={handleReply}>
                      {t('inbox.sendReply')} <span className={styles.replyShortcut}>{'\u23CE'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
