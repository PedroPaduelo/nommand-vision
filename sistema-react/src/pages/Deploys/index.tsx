import { useState, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import type { Deploy } from '@/types/index.ts'
import { MetricCard } from '@/components/molecules/MetricCard'
import { FilterBar } from '@/components/molecules/FilterBar'
import { Modal } from '@/components/molecules/Modal'
import { TerminalOutput } from '@/components/molecules/TerminalOutput'
import { useDeploys, useCancelDeploy, useRollbackDeploy } from '@/hooks/queries/useDeployQueries.ts'
import { useConfirm } from '@/hooks/useConfirm.ts'
import { useToast } from '@/hooks/useToast.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './Deploys.module.css'

const envClassMap: Record<string, string> = {
  prod: styles.envProd,
  production: styles.envProd,
  staging: styles.envStaging,
  preview: styles.envPreview,
}

const dotClassMap: Record<string, string> = {
  success: styles.dotSuccess,
  fail: styles.dotFail,
  building: styles.dotBuilding,
}

const statusColorMap: Record<string, string> = {
  success: styles.detailValueGreen,
  fail: styles.detailValueRed,
  building: styles.detailValueYellow,
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  success: 'deploys.statusSuccess',
  fail: 'deploys.statusFail',
  building: 'deploys.statusBuilding',
}

function buildTerminalLines(deploy: Deploy, t: (key: string, params?: Record<string, string | number>) => string) {
  const lines: { text: string; type: 'path' | 'output' | 'warn' | 'error' | 'success' }[] = [
    { text: `[deploy] ${t('deploys.termStarting', { num: deploy.num })}`, type: 'success' },
    { text: `[build] ${t('deploys.termInstalling')}`, type: 'output' },
    { text: `[build] ${t('deploys.termRunningBuild')}`, type: 'output' },
  ]

  if (deploy.status === 'fail') {
    lines.push({ text: `[error] ${t('deploys.termBuildFailed')}`, type: 'error' as const })
  } else {
    lines.push({ text: `[build] ${t('deploys.termBuildCompleted')}`, type: 'success' as const })
    lines.push({ text: `[deploy] ${t('deploys.termUploading')}`, type: 'output' as const })
    lines.push({
      text: deploy.status === 'building' ? `[deploy] ${t('deploys.termDeploying')}` : `[deploy] ${t('deploys.termDeploySuccess')}`,
      type: 'success' as const,
    })
  }

  return lines
}

export default function Deploys() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [selectedDeploy, setSelectedDeploy] = useState<Deploy | null>(null)

  const { data: deploys = [] } = useDeploys(filter)
  const cancelMutation = useCancelDeploy()
  const rollbackMutation = useRollbackDeploy()
  const confirm = useConfirm()
  const toast = useToast()

  const activeDeploy = useMemo(
    () => deploys.find(d => d.status === 'building'),
    [deploys]
  )

  const totalDeploys = deploys.length

  const successRate = useMemo(() => {
    if (deploys.length === 0) return '0%'
    const successes = deploys.filter(d => d.status === 'success').length
    return `${((successes / deploys.length) * 100).toFixed(1)}%`
  }, [deploys])

  const avgTime = useMemo(() => {
    const timed = deploys.filter(d => d.duration.endsWith('s'))
    if (timed.length === 0) return '0s'
    const total = timed.reduce((sum, d) => sum + parseFloat(d.duration), 0)
    return `${(total / timed.length).toFixed(1)}s`
  }, [deploys])

  const handleRowClick = useCallback((deploy: Deploy) => {
    setSelectedDeploy(deploy)
  }, [])

  const handleCancel = useCallback(async (deploy: Deploy) => {
    const ok = await confirm.confirm(
      t('deploys.cancelDeploy'),
      t('deploys.cancelConfirm', { num: deploy.num }),
      true
    )
    if (!ok) return
    cancelMutation.mutate(deploy.num)
    setSelectedDeploy(null)
    toast.warning(t('deploys.deployCancelled', { num: deploy.num }))
  }, [confirm, cancelMutation, toast])

  const handleRollback = useCallback(async (deploy: Deploy) => {
    const ok = await confirm.confirm(
      t('deploys.rollback'),
      t('deploys.rollbackConfirm', { num: deploy.num })
    )
    if (!ok) return
    rollbackMutation.mutate(deploy.num)
    setSelectedDeploy(null)
    toast.success(t('deploys.rollbackStarted', { num: deploy.num }))
  }, [confirm, rollbackMutation, toast])

  return (
    <div className={styles.page}>
      <div className={styles.metricsRow}>
        <MetricCard label={t('deploys.totalDeploys')} value={totalDeploys} sub={t('deploys.thisWeek')} trend="up" />
        <MetricCard label={t('deploys.successRate')} value={successRate} sub={t('deploys.successCount')} green />
        <MetricCard label={t('deploys.avgTime')} value={avgTime} sub={t('deploys.vsLastMonth')} trend="up" />
      </div>

      <FilterBar
        filters={[
          { key: 'all', label: t('deploys.filterAll') },
          { key: 'prod', label: t('deploys.filterProduction') },
          { key: 'staging', label: t('deploys.filterStaging') },
          { key: 'preview', label: t('deploys.filterPreview') },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <div className={styles.deploysCard}>
        <div className={styles.deploysFull}>
          <div className={clsx(styles.deployRow, styles.header)}>
            <span>{t('deploys.headerStatus')}</span>
            <span>{t('deploys.headerDeploy')}</span>
            <span>{t('deploys.headerEnvironment')}</span>
            <span className={styles.time}>{t('deploys.headerTime')}</span>
            <span className={styles.duration}>{t('deploys.headerDuration')}</span>
          </div>

          {deploys.map(deploy => (
            <div
              key={deploy.num}
              className={styles.deployRow}
              onClick={() => handleRowClick(deploy)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') handleRowClick(deploy) }}
            >
              <div className={styles.statusCol}>
                <span className={clsx(styles.dot, dotClassMap[deploy.status] ?? styles.dotSuccess)} />
                <span className={styles.dHash}>#{deploy.num}</span>
              </div>
              <div className={styles.branchCol}>
                <strong>{deploy.branch}</strong>
                <span className={styles.deployer}>{deploy.deployer}</span>
              </div>
              <div>
                <span className={clsx(styles.dEnv, envClassMap[deploy.env] ?? styles.envStaging)}>
                  {deploy.env}
                </span>
              </div>
              <div className={styles.time}>{deploy.time}</div>
              <div className={styles.duration}>{deploy.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {activeDeploy && (
        <div className={styles.activeCard}>
          <div className={styles.activeLabel}>
            <span className={styles.activePulse} />
            {t('deploys.activeDeploy')} — #{activeDeploy.num} {activeDeploy.env}
          </div>
          <TerminalOutput
            lines={[
              { text: `deploy $ ${t('deploys.startingBuild')}`, type: 'path' },
              { text: `\u2713 ${t('deploys.termDepsInstalled')}`, type: 'output' },
              { text: `\u2713 ${t('deploys.termTsCompiled')}`, type: 'output' },
              { text: `\u2713 ${t('deploys.termAssetsOptimized')}`, type: 'output' },
              { text: `\u25CB ${t('deploys.termUploadingCdn')}`, type: 'warn' },
              { text: 'deploy $ ', type: 'path' },
            ]}
            showCursor
          />
        </div>
      )}

      <Modal
        open={!!selectedDeploy}
        onClose={() => setSelectedDeploy(null)}
        title={selectedDeploy ? `Deploy #${selectedDeploy.num}` : ''}
        width="520px"
      >
        {selectedDeploy && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className={clsx(styles.dEnv, envClassMap[selectedDeploy.env] ?? styles.envStaging)} style={{ padding: '4px 12px', borderRadius: 6, fontSize: '.75rem' }}>
                {selectedDeploy.env}
              </span>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t('deploys.headerStatus')}</span>
                <span className={clsx(styles.detailValue, statusColorMap[selectedDeploy.status])}>
                  {STATUS_LABEL_KEYS[selectedDeploy.status] ? t(STATUS_LABEL_KEYS[selectedDeploy.status]) : selectedDeploy.status}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t('deploys.duration')}</span>
                <span className={styles.detailValue}>{selectedDeploy.duration}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t('deploys.branch')}</span>
                <span className={clsx(styles.detailValue, styles.detailValueMono)}>
                  {selectedDeploy.branch}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{t('deploys.author')}</span>
                <span className={styles.detailValue}>{selectedDeploy.deployer}</span>
              </div>
            </div>

            <TerminalOutput lines={buildTerminalLines(selectedDeploy, t)} showCursor={selectedDeploy.status === 'building'} />

            <div className={styles.detailActions} style={{ marginTop: '1.5rem' }}>
              {selectedDeploy.status === 'building' && (
                <button className={styles.btnDanger} onClick={() => handleCancel(selectedDeploy)}>
                  {t('deploys.cancelDeploy')}
                </button>
              )}
              {selectedDeploy.status === 'success' && (
                <button className={styles.btnRollback} onClick={() => handleRollback(selectedDeploy)}>
                  {t('deploys.rollback')}
                </button>
              )}
              <button className={styles.btnSecondary} onClick={() => setSelectedDeploy(null)}>
                {t('deploys.close')}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
