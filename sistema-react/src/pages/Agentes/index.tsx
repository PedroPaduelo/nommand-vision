import { useState, useCallback, useMemo, useReducer } from 'react'
import clsx from 'clsx'
import type { Agent } from '@/types/index.ts'
import { MetricCard } from '@/components/molecules/MetricCard'
import { Modal } from '@/components/molecules/Modal'
import { TerminalOutput } from '@/components/molecules/TerminalOutput'
import { Sparkline } from '@/components/organisms/Sparkline'
import { IconPicker } from '@/components/molecules/IconPicker'
import { PillSelector } from '@/components/molecules/PillSelector'
import { useAgents, useCreateAgent, useStartAgent, useStopAgent, useDeleteAgent } from '@/hooks/queries/useAgentQueries.ts'
import { useConfirm } from '@/hooks/useConfirm.ts'
import { useToast } from '@/hooks/useToast.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './Agentes.module.css'

const AGENT_EMOJIS = ['\u{1F916}', '\u{1F6E1}\uFE0F', '\u2699\uFE0F', '\u{1F4CA}', '\u{1F4DD}', '\u{1F9EA}', '\u{1F50D}', '\u26A1', '\u{1F310}', '\u{1F9E0}']
const AGENT_TYPES = ['Code Generation', 'Security Audit', 'CI/CD Orchestrator', 'Data Analytics', 'Documentation', 'Test Generation', 'Code Review', 'Custom']
const MODEL_OPTIONS = ['nommand-v3-turbo', 'nommand-v2-fast', 'nommand-v3-reason', 'nommand-v1-lite']

const badgeClassMap: Record<string, string> = {
  running: styles.badgeRunning,
  idle: styles.badgeIdle,
  stopped: styles.badgeStopped,
  error: styles.badgeError,
}

const STATUS_KEYS: Record<string, string> = {
  running: 'agentes.statusRunning',
  idle: 'agentes.statusIdle',
  stopped: 'agentes.statusStopped',
  error: 'agentes.statusError',
}

function buildLogLines(agent: Agent) {
  if (agent.status === 'error') {
    return [
      { text: `[14:32:01] INFO Agent started \u2014 model ${agent.model}`, type: 'output' as const },
      { text: '[14:32:02] INFO Connected to GitHub API', type: 'success' as const },
      { text: `[14:32:15] TASK Reviewing PR #847...`, type: 'warn' as const },
      { text: '[14:32:18] WARN Rate limit approaching (82%)', type: 'warn' as const },
      { text: '[14:32:22] ERROR API timeout after 30s \u2014 retrying (1/3)', type: 'error' as const },
      { text: '[14:32:55] ERROR API timeout after 30s \u2014 retrying (2/3)', type: 'error' as const },
      { text: '[14:33:28] FATAL Max retries exceeded. Agent halted.', type: 'error' as const },
    ]
  }
  return [
    { text: `[14:32:01] INFO Agent started \u2014 model ${agent.model}`, type: 'output' as const },
    { text: '[14:32:02] INFO Tools loaded: GitHub API, Terminal', type: 'success' as const },
    { text: '[14:32:03] INFO Watching for triggers...', type: 'success' as const },
    { text: `[14:32:15] TASK Processing task #${agent.tasks}...`, type: 'warn' as const },
    { text: `[14:32:16] OK Task completed in ${agent.latency}`, type: 'success' as const },
    { text: '[14:32:20] INFO Queue clear. Waiting...', type: 'success' as const },
  ]
}

function generateSparkData(status: string, seed: number): number[] {
  if (status === 'error') {
    const data = Array.from({ length: 20 }, (_, i) => ((seed * 31 + i * 17) % 50) / 10)
    data[18] = 0
    data[19] = 0
    return data
  }
  if (status === 'stopped') {
    return Array.from({ length: 20 }, () => 0)
  }
  return Array.from({ length: 20 }, (_, i) => ((seed * 31 + i * 17) % 80) + 20)
}

interface AgentFormState {
  name: string
  desc: string
  type: string
  emoji: string
  model: string[]
}

type AgentFormAction =
  | { type: 'SET_FIELD'; field: keyof AgentFormState; value: AgentFormState[keyof AgentFormState] }
  | { type: 'RESET' }

const initialAgentFormState: AgentFormState = {
  name: '',
  desc: '',
  type: AGENT_TYPES[0],
  emoji: AGENT_EMOJIS[0],
  model: [MODEL_OPTIONS[0]],
}

function agentFormReducer(state: AgentFormState, action: AgentFormAction): AgentFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return initialAgentFormState
  }
}

export default function Agentes() {
  const [createOpen, setCreateOpen] = useState(false)
  const [detailAgent, setDetailAgent] = useState<Agent | null>(null)
  const [form, dispatchForm] = useReducer(agentFormReducer, initialAgentFormState)

  const { data: agents = [] } = useAgents()
  const createMutation = useCreateAgent()
  const startMutation = useStartAgent()
  const stopMutation = useStopAgent()
  const deleteMutation = useDeleteAgent()
  const confirm = useConfirm()
  const toast = useToast()
  const { t } = useTranslation()

  const runningCount = useMemo(() => agents.filter(a => a.status === 'running').length, [agents])
  const totalTokens = '1.2M'
  const avgLatency = '23ms'

  const sparkDataMap = useMemo(() => {
    const map: Record<string, number[]> = {}
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i]
      map[a.id] = generateSparkData(a.status, i + 1)
    }
    return map
  }, [agents])

  const resetForm = useCallback(() => {
    dispatchForm({ type: 'RESET' })
  }, [])

  const handleCreate = useCallback(() => {
    if (!form.name.trim()) {
      toast.warning(t('agentes.nameRequired'))
      return
    }
    createMutation.mutate({
      name: form.name.trim(),
      desc: form.desc.trim() || t('agentes.customDesc'),
      type: form.type,
      emoji: form.emoji,
      model: form.model[0] ?? MODEL_OPTIONS[0],
    })
    setCreateOpen(false)
    resetForm()
    toast.success(t('agentes.agentCreated', { name: form.name }))
  }, [form, createMutation, toast, t, resetForm])

  const handleStart = useCallback(async (agent: Agent) => {
    startMutation.mutate(agent.id)
    setDetailAgent(null)
    toast.success(t('agentes.agentStarted', { name: agent.name }))
  }, [startMutation, toast, t])

  const handleStop = useCallback(async (agent: Agent) => {
    stopMutation.mutate(agent.id)
    setDetailAgent(null)
    toast.warning(t('agentes.agentStopped', { name: agent.name }))
  }, [stopMutation, toast, t])

  const handleDelete = useCallback(async (agent: Agent) => {
    const ok = await confirm.confirm(
      t('agentes.deleteAgent'),
      t('agentes.deleteConfirm', { name: agent.name }),
      true
    )
    if (!ok) return
    deleteMutation.mutate(agent.id)
    setDetailAgent(null)
    toast.warning(t('agentes.agentDeleted', { name: agent.name }))
  }, [confirm, deleteMutation, toast, t])

  const openCreate = useCallback(() => {
    resetForm()
    setCreateOpen(true)
  }, [resetForm])

  return (
    <div className={styles.page}>
      <div className={styles.metricsRow}>
        <MetricCard label={t('agentes.totalAgents')} value={agents.length} sub={`${runningCount} ${t('agentes.running')}`} />
        <MetricCard label={t('agentes.running')} value={runningCount} sub={`${t('agentes.ofTotal', { count: agents.length })}`} green />
        <MetricCard label={t('agentes.tokensConsumed')} value={totalTokens} sub={t('agentes.tokenLimit')} />
        <MetricCard label={t('agentes.avgTime')} value={avgLatency} sub={t('agentes.latencyAvg')} />
      </div>

      <div className={styles.agentsGrid}>
        {agents.map(agent => (
          <div
            key={agent.id}
            className={styles.agentCard}
            onClick={() => setDetailAgent(agent)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setDetailAgent(agent) }}
          >
            <div className={styles.agentTop}>
              <div className={styles.agentName}>
                <span className={styles.agentEmoji}>{agent.emoji}</span>
                <div>
                  <div className={styles.agentNameText}>{agent.name}</div>
                  <div className={styles.agentModel}>{agent.model}</div>
                </div>
              </div>
              <span className={clsx(styles.agentStatusBadge, badgeClassMap[agent.status] ?? styles.badgeIdle)}>
                {agent.status === 'running' && <span className={styles.pulse} />}
                {STATUS_KEYS[agent.status] ? t(STATUS_KEYS[agent.status]) : agent.status}
              </span>
            </div>

            <div className={styles.agentDesc}>{agent.desc}</div>

            <Sparkline
              data={sparkDataMap[agent.id] ?? []}
              color={agent.status === 'error' ? '#ef4444' : agent.color}
            />

            <div className={styles.agentStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{t('agentes.statTasks')}</span>
                <span className={styles.statValue}>{agent.tasks.toLocaleString()}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{t('agentes.statTokens')}</span>
                <span className={styles.statValue}>{agent.tokens}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>{t('agentes.statUptime')}</span>
                <span className={styles.statValue}>{agent.uptime}</span>
              </div>
            </div>
          </div>
        ))}

        <button className={styles.agentAdd} onClick={openCreate}>
          {t('agentes.createAgent')}
        </button>
      </div>

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('agentes.createNewAgent')}
        width="560px"
      >
        <div className={styles.formGroup}>
          <label>{t('agentes.agentName')}</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder={t('agentes.agentNamePlaceholder')}
            value={form.name}
            onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t('agentes.description')}</label>
          <textarea
            className={styles.formTextarea}
            placeholder={t('agentes.descriptionPlaceholder')}
            value={form.desc}
            onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'desc', value: e.target.value })}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t('agentes.type')}</label>
          <select
            className={styles.formSelect}
            value={form.type}
            onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'type', value: e.target.value })}
          >
            {AGENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>{t('agentes.icon')}</label>
          <IconPicker
            options={AGENT_EMOJIS}
            selected={form.emoji}
            onChange={v => dispatchForm({ type: 'SET_FIELD', field: 'emoji', value: v })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t('agentes.baseModel')}</label>
          <PillSelector
            options={MODEL_OPTIONS}
            selected={form.model}
            onChange={v => dispatchForm({ type: 'SET_FIELD', field: 'model', value: v })}
          />
        </div>

        <div className={styles.formActions}>
          <button className={styles.btnSecondary} onClick={() => setCreateOpen(false)}>
            {t('agentes.cancel')}
          </button>
          <button className={styles.btnPrimary} onClick={handleCreate}>
            {t('agentes.createAgent')}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!detailAgent}
        onClose={() => setDetailAgent(null)}
        title={t('agentes.agentDetails')}
        width="560px"
      >
        {detailAgent && (
          <>
            <div className={styles.detailTop}>
              <div
                className={styles.detailIcon}
                style={{
                  background: `${detailAgent.color}15`,
                  border: `1px solid ${detailAgent.color}25`,
                }}
              >
                {detailAgent.emoji}
              </div>
              <div className={styles.detailInfo}>
                <h3>{detailAgent.name}</h3>
                <div className={styles.detailType}>{detailAgent.type}</div>
              </div>
              <span className={clsx(styles.agentStatusBadge, badgeClassMap[detailAgent.status] ?? styles.badgeIdle)}>
                {detailAgent.status === 'running' && <span className={styles.pulse} />}
                {STATUS_KEYS[detailAgent.status] ? t(STATUS_KEYS[detailAgent.status]) : detailAgent.status}
              </span>
            </div>

            <div className={styles.detailSection}>
              <h4>{t('agentes.description')}</h4>
              <div className={styles.detailDesc}>{detailAgent.desc}</div>
            </div>

            <div className={styles.detailSection}>
              <h4>{t('agentes.metrics')}</h4>
              <div className={styles.detailMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('agentes.tasksExecuted')}</span>
                  <span className={styles.metaValue}>{detailAgent.tasks.toLocaleString()}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('agentes.tokensConsumed')}</span>
                  <span className={styles.metaValue}>{detailAgent.tokens}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('agentes.uptime')}</span>
                  <span
                    className={styles.metaValue}
                    style={{ color: detailAgent.uptime === '100%' ? 'var(--green)' : undefined }}
                  >
                    {detailAgent.uptime}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('agentes.avgLatency')}</span>
                  <span className={styles.metaValue}>{detailAgent.latency}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('agentes.model')}</span>
                  <span className={styles.metaValue} style={{ color: 'var(--purple)', fontSize: '.8rem' }}>
                    {detailAgent.model}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('agentes.lastEvent')}</span>
                  <span className={styles.metaValue} style={{ fontSize: '.8rem' }}>
                    {detailAgent.lastRun}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4>{t('agentes.recentLogs')}</h4>
              <TerminalOutput
                lines={buildLogLines(detailAgent)}
                showCursor={detailAgent.status === 'running'}
              />
            </div>

            <div className={styles.detailActions}>
              {detailAgent.status === 'running' ? (
                <button className={styles.btnStop} onClick={() => handleStop(detailAgent)}>
                  {t('agentes.stopAgent')}
                </button>
              ) : (
                <button className={styles.btnRun} onClick={() => handleStart(detailAgent)}>
                  {t('agentes.startAgent')}
                </button>
              )}
              <button className={styles.btnEdit} onClick={() => {
                setDetailAgent(null)
                openCreate()
                toast.info(t('agentes.editing', { name: detailAgent.name }))
              }}>
                {t('agentes.edit')}
              </button>
              <button className={styles.btnDelete} onClick={() => handleDelete(detailAgent)}>
                {t('agentes.delete')}
              </button>
              <button className={styles.btnSecondary} onClick={() => setDetailAgent(null)}>
                {t('agentes.close')}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
