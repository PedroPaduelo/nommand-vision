import { useState, useMemo, useCallback, useReducer } from 'react'
import clsx from 'clsx'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.ts'
import { useToast } from '@/hooks/useToast.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useProjects, useCreateProject } from '@/hooks/queries/useProjectQueries.ts'
import { Modal } from '@/components/molecules/Modal/index.tsx'
import { ColorPicker } from '@/components/molecules/ColorPicker/index.tsx'
import { IconPicker } from '@/components/molecules/IconPicker/index.tsx'
import { PillSelector } from '@/components/molecules/PillSelector/index.tsx'
import { ActivityTimeline } from '@/components/organisms/ActivityTimeline/index.tsx'
import type { Project } from '@/types/index.ts'
import styles from './Projetos.module.css'

const PROJECT_COLORS = [
  '#60a5fa', '#10b981', '#c026d3', '#f59e0b',
  '#8b5cf6', '#ef4444', '#eab308', '#22c55e',
]

const PROJECT_ICONS = [
  '\u{1F310}', '\u{26A1}', '\u{1F4CA}', '\u{1F512}', '\u{1F3A8}',
  '\u{2699}\uFE0F', '\u{1F916}', '\u{1F4F1}', '\u{270F}\uFE0F', '\u{1F9E9}',
]

const STACK_OPTIONS = [
  'React', 'TypeScript', 'Tailwind', 'Node.js',
  'Python', 'GraphQL', 'PostgreSQL', 'Redis',
  'Docker', 'Kubernetes',
]

const AGENT_OPTIONS = [
  '\u{1F916} Codex', '\u{1F6E1}\uFE0F Sentinel', '\u{1F9EA} QA Bot',
  '\u{2699}\uFE0F Pipeline', '\u{1F4DD} Scribe', '\u{1F50D} Reviewer',
]

const FRAMEWORKS = [
  'Next.js 14', 'Vite + React', 'Remix', 'Node.js', 'FastAPI', 'Go', 'Python',
]

const ENVIRONMENTS = [
  'Production + Staging + Preview',
  'Production + Staging',
  'Production Only',
]

const NODE_VERSIONS = ['20.x LTS', '18.x LTS', '22.x']

const EMOJI_MAP: Record<string, string> = {
  Landing: '\u{1F310}', Dashboard: '\u{1F4CA}', Design: '\u{1F3A8}',
  Mobile: '\u{1F4F1}', Blog: '\u{270F}', API: '\u{26A1}', Auth: '\u{1F512}',
  Data: '\u{1F4BE}', Micro: '\u{2699}', CDN: '\u{1F310}', Brand: '\u{1F3A8}',
  Component: '\u{1F9E9}', '3D': '\u{1F4A0}', Motion: '\u{1F3AC}',
  Icon: '\u{2B50}', ML: '\u{1F916}', Lake: '\u{1F4A7}', Analytics: '\u{1F4C8}',
  Jupyter: '\u{1F4D3}', Airflow: '\u{1F4A8}',
}

function getProjectEmoji(name: string): string {
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (name.includes(key)) return emoji
  }
  return '\u{1F4C1}'
}

interface ProjectFormState {
  name: string
  desc: string
  framework: string
  branch: string
  color: string
  icon: string
  stack: string[]
  agents: string[]
  env: string
  node: string
}

type ProjectFormAction =
  | { type: 'SET_FIELD'; field: keyof ProjectFormState; value: ProjectFormState[keyof ProjectFormState] }
  | { type: 'RESET' }

const initialProjectFormState: ProjectFormState = {
  name: '',
  desc: '',
  framework: 'Next.js 14',
  branch: 'main',
  color: '#60a5fa',
  icon: '\u{1F310}',
  stack: ['React', 'TypeScript'],
  agents: ['\u{1F916} Codex', '\u{1F9EA} QA Bot'],
  env: 'Production + Staging + Preview',
  node: '20.x LTS',
}

function projectFormReducer(state: ProjectFormState, action: ProjectFormAction): ProjectFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return initialProjectFormState
  }
}

type FilterKey = 'all' | 'active' | 'draft'

export default function Projetos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { t } = useTranslation()
  const { data: projects = [], isLoading } = useProjects(user.role)
  const createMutation = useCreateProject()

  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const [form, dispatchForm] = useReducer(projectFormReducer, initialProjectFormState)

  const counts = useMemo(() => ({
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    draft: projects.filter(p => p.status === 'draft').length,
  }), [projects])

  const filtered = useMemo(() => {
    let list = projects
    if (filter === 'active') list = list.filter(p => p.status === 'active')
    if (filter === 'draft') list = list.filter(p => p.status === 'draft')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      )
    }
    return list
  }, [projects, filter, search])

  const openCreate = useCallback(() => {
    dispatchForm({ type: 'RESET' })
    setShowCreate(true)
  }, [])

  const handleCreate = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.warning(t('projects.nameRequired'))
      return
    }
    const agentNames = form.agents.map(a => a.replace(/^[^\w]+/, '').trim())
    createMutation.mutate(
      {
        name: form.name.trim(),
        desc: form.desc.trim() || t('projects.newProjectDesc'),
        icon: form.color,
        framework: form.framework,
        branch: form.branch,
        stack: form.stack,
        agents: agentNames,
        role: user.role,
      },
      {
        onSuccess: () => {
          setShowCreate(false)
          toast.success(t('projects.created').replace('{name}', form.name))
        },
      }
    )
  }, [form, user.role, createMutation, toast, t])

  const getSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

  const makeActivity = (p: Project) => [
    { color: 'green', text: t('projects.deploySuccess').replace('{num}', String(p.deploys)), time: p.lastDeploy },
    { color: 'neon', text: t('projects.reviewedPr').replace('{agent}', p.agents[0] ?? 'Codex').replace('{num}', String(Math.floor(Math.random() * 200 + 100))), time: t('projects.timeAgo.3h') },
    { color: 'blue', text: t('projects.branchUpdated').replace('{branch}', p.branch).replace('{count}', String(Math.floor(Math.random() * 5 + 1))), time: t('projects.timeAgo.5h') },
    { color: 'green', text: t('projects.testsRan').replace('{agent}', p.agents[1] ?? 'QA Bot'), time: t('projects.timeAgo.8h') },
    { color: 'purple', text: t('projects.depsScan'), time: t('projects.timeAgo.12h') },
  ]

  if (isLoading) {
    return <div className={styles.page} style={{ textAlign: 'center', color: 'var(--muted)', padding: '3rem' }}>{t('projetos.loadingProjects')}</div>
  }

  return (
    <div className={styles.page}>
      {/* Filter bar */}
      <div className={styles.filterBar}>
        {([
          { key: 'all' as FilterKey, label: t('projects.filterAll'), count: counts.all },
          { key: 'active' as FilterKey, label: t('projects.filterActive'), count: counts.active },
          { key: 'draft' as FilterKey, label: t('projects.filterDrafts'), count: counts.draft },
        ]).map(f => (
          <button
            key={f.key}
            className={clsx(styles.filterBtn, filter === f.key && styles.filterBtnActive)}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={t('projetos.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects grid */}
      <div className={styles.projectsGrid}>
        {filtered.map(p => (
          <div
            key={p.id}
            className={styles.projectCard}
            onClick={() => setDetailProject(p)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setDetailProject(p) }}
          >
            <div className={styles.projectTop}>
              <div
                className={styles.projectIcon}
                style={{ background: `${p.icon}15`, border: `1px solid ${p.icon}25` }}
              >
                {getProjectEmoji(p.name)}
              </div>
              <span className={clsx(styles.projectStatusBadge, p.status === 'active' ? styles.statusActive : styles.statusDraft)}>
                {p.status === 'active' ? t('common.active') : t('common.draft')}
              </span>
            </div>
            <div className={styles.projectName}>{p.name}</div>
            <div className={styles.projectDesc}>{p.desc}</div>
            <div className={styles.projectMeta}>
              <span>{p.commits} {t('projects.commitsLabel')}</span>
              <span>{p.branch}</span>
            </div>
          </div>
        ))}
        <div
          className={styles.projectAdd}
          onClick={openCreate}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') openCreate() }}
        >
          +
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        open={!!detailProject}
        onClose={() => setDetailProject(null)}
        title={t('projects.detailTitle')}
        width="720px"
      >
        {detailProject && (
          <>
            <div className={styles.detailTop}>
              <div
                className={styles.detailIcon}
                style={{ background: `${detailProject.icon}15`, border: `1px solid ${detailProject.icon}25` }}
              >
                {getProjectEmoji(detailProject.name)}
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailName}>{detailProject.name}</div>
                <div className={styles.detailDesc}>{detailProject.desc}</div>
              </div>
              <span
                className={clsx(styles.projectStatusBadge, detailProject.status === 'active' ? styles.statusActive : styles.statusDraft)}
                style={{ flexShrink: 0 }}
              >
                {detailProject.status === 'active' ? t('common.active') : t('common.draft')}
              </span>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>{t('projects.metrics')}</div>
              <div className={styles.detailMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('projects.commitsLabel')}</span>
                  <span className={styles.metaValue}>{detailProject.commits}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('projects.deploysLabel')}</span>
                  <span className={styles.metaValue}>{detailProject.deploys}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('projects.uptimeLabel')}</span>
                  <span
                    className={styles.metaValue}
                    style={{
                      color: detailProject.uptime === '100%'
                        ? 'var(--green)'
                        : detailProject.uptime === '\u2014' ? 'var(--muted)' : 'var(--text)',
                    }}
                  >
                    {detailProject.uptime}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('projects.branchLabel')}</span>
                  <span className={styles.metaValue} style={{ fontSize: '.78rem', color: 'var(--neon)' }}>
                    {detailProject.branch}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>{t('projects.stack')}</div>
              <div className={styles.stackTags}>
                {detailProject.stack.map(s => (
                  <span key={s} className={styles.stackTag}>{s}</span>
                ))}
                <span className={clsx(styles.stackTag, styles.stackTagMuted)}>
                  {detailProject.framework}
                </span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>{t('projects.linkedAgentsSection')}</div>
              <div className={styles.agentChips}>
                {detailProject.agents.map(a => (
                  <div key={a} className={styles.agentChip}>
                    <span className={styles.agentDot} />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailSectionTitle}>{t('projects.recentActivity')}</div>
              <ActivityTimeline items={makeActivity(detailProject)} />
            </div>

            <div className={styles.detailActions}>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setDetailProject(null)
                  navigate(`/projetos/${getSlug(detailProject.name)}`)
                }}
              >
                {t('projects.openProject')}
              </button>
              <button className={styles.btnSecondary} onClick={() => setDetailProject(null)}>
                {t('common.close')}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('projetos.createNewProject')}
        width="600px"
      >
        <form onSubmit={handleCreate}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('projects.projectName')}</label>
            <input
              className={styles.formInput}
              type="text"
              placeholder={t('projetos.namePlaceholder')}
              value={form.name}
              onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('projects.description')}</label>
            <textarea
              className={styles.formTextarea}
              placeholder={t('projetos.descPlaceholder')}
              rows={3}
              value={form.desc}
              onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'desc', value: e.target.value })}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('projects.framework')}</label>
              <select
                className={styles.formSelect}
                value={form.framework}
                onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'framework', value: e.target.value })}
              >
                {FRAMEWORKS.map(fw => (
                  <option key={fw} value={fw}>{fw}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('projects.defaultBranch')}</label>
              <input
                className={styles.formInput}
                type="text"
                value={form.branch}
                onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'branch', value: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('projects.projectColor')}</label>
            <ColorPicker colors={PROJECT_COLORS} selected={form.color} onChange={v => dispatchForm({ type: 'SET_FIELD', field: 'color', value: v })} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('projects.icon')}</label>
            <IconPicker options={PROJECT_ICONS} selected={form.icon} onChange={v => dispatchForm({ type: 'SET_FIELD', field: 'icon', value: v })} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('projects.stackTech')}</label>
            <PillSelector options={STACK_OPTIONS} selected={form.stack} onChange={v => dispatchForm({ type: 'SET_FIELD', field: 'stack', value: v })} multi />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('projects.linkedAgents')}</label>
            <PillSelector options={AGENT_OPTIONS} selected={form.agents} onChange={v => dispatchForm({ type: 'SET_FIELD', field: 'agents', value: v })} multi />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('projects.environment')}</label>
              <select
                className={styles.formSelect}
                value={form.env}
                onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'env', value: e.target.value })}
              >
                {ENVIRONMENTS.map(env => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('projetos.nodeVersion')}</label>
              <select
                className={styles.formSelect}
                value={form.node}
                onChange={e => dispatchForm({ type: 'SET_FIELD', field: 'node', value: e.target.value })}
              >
                {NODE_VERSIONS.map(nv => (
                  <option key={nv} value={nv}>{nv}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={() => setShowCreate(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('projetos.creating') : t('projects.createProject')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
