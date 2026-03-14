import { useState, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import type { MarketplaceAgent } from '@/types/index.ts'
import { useMarketplaceAgents, useInstallAgent } from '@/hooks/queries/useMarketplaceQueries.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './Marketplace.module.css'

const CATEGORY_KEYS = ['all', 'security', 'quality', 'productivity', 'devops', 'data', 'docs']

export default function Marketplace() {
  const { t } = useTranslation()
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const { data: agents = [] } = useMarketplaceAgents(category, search)
  const installMutation = useInstallAgent()
  const { user } = useAuth()

  const [installingIds, setInstallingIds] = useState<Set<string>>(new Set())
  const [localInstalled, setLocalInstalled] = useState<Set<string>>(new Set())

  const isInstalled = useCallback((agent: MarketplaceAgent) => {
    return agent.installed || localInstalled.has(agent.id)
  }, [localInstalled])

  const isInstalling = useCallback((id: string) => {
    return installingIds.has(id)
  }, [installingIds])

  async function handleInstall(id: string) {
    if (isInstalling(id)) return
    setInstallingIds(prev => new Set(prev).add(id))

    const delay = 1500 + Math.random() * 1000
    await new Promise(r => setTimeout(r, delay))

    try {
      await installMutation.mutateAsync(id)
      setLocalInstalled(prev => new Set(prev).add(id))
    } finally {
      setInstallingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const recommended = useMemo(() => {
    return agents.filter(a => a.recommended.includes(user.role))
  }, [agents, user.role])

  const filtered = useMemo(() => {
    let result = agents
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }
    return result
  }, [agents, search])

  function renderCard(agent: MarketplaceAgent) {
    const installed = isInstalled(agent)
    const installing = isInstalling(agent.id)

    return (
      <div key={agent.id} className={styles.mpCard}>
        <div className={styles.mpCardTop}>
          <div className={styles.mpCardTopLeft}>
            <span className={styles.mpIcon}>{agent.icon}</span>
            <span className={styles.mpName}>{agent.name}</span>
            <span className={styles.mpAuthor}>{agent.author}</span>
          </div>
          {agent.verified && (
            <span className={styles.mpVerified}>{t('common.verified')}</span>
          )}
        </div>

        <div className={styles.mpDesc}>{agent.desc}</div>

        <div className={styles.mpTags}>
          {agent.tags.map(tag => (
            <span key={tag} className={styles.mpTag}>{tag}</span>
          ))}
        </div>

        <div className={styles.mpFooter}>
          <div className={styles.mpMeta}>
            <span className={styles.mpStars}>&#9733; {agent.stars}</span>
            <span className={styles.mpDownloads}>{agent.downloads} {t('marketplace.downloads')}</span>
          </div>
          {installed ? (
            <button className={clsx(styles.mpInstallBtn, styles.mpInstallBtnInstalled)}>
              {t('common.installed')}
            </button>
          ) : installing ? (
            <button className={clsx(styles.mpInstallBtn, styles.mpInstallBtnInstalling)}>
              <span className={styles.spinner} />
              {t('marketplace.installing')}
            </button>
          ) : (
            <button
              className={clsx(styles.mpInstallBtn, styles.mpInstallBtnDefault)}
              onClick={() => handleInstall(agent.id)}
            >
              {t('common.install')}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.marketplaceHero}>
        <h1>{t('marketplace.title')}</h1>
        <p className={styles.heroDesc}>
          {t('marketplace.heroDesc')}
        </p>
        <div className={styles.heroSearch}>
          <span className={styles.heroSearchIcon}>&#128269;</span>
          <input
            className={styles.heroSearchInput}
            type="text"
            placeholder={t('marketplace.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.marketplaceCategories}>
        {CATEGORY_KEYS.map(key => (
          <button
            key={key}
            className={clsx(styles.catBtn, category === key && styles.catBtnActive)}
            onClick={() => setCategory(key)}
          >
            {t(`marketplace.cat.${key}`)}
          </button>
        ))}
      </div>

      {!search && recommended.length > 0 && (
        <div className={styles.marketplaceSection}>
          <h2>{t('marketplace.recommendedForYou')}</h2>
          <div className={styles.marketplaceGrid}>
            {recommended.map(renderCard)}
          </div>
        </div>
      )}

      <div className={styles.marketplaceSection}>
        <h2>{t('marketplace.allSection')}</h2>
        <div className={styles.marketplaceGrid}>
          {filtered.length === 0 && (
            <div className={styles.emptyGrid}>{t('marketplace.noAgents')}</div>
          )}
          {filtered.map(renderCard)}
        </div>
      </div>
    </div>
  )
}
