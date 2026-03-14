import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useProjectBySlug } from '@/hooks/queries/useProjectQueries.ts'
import css from './ProjetoDetalhe.module.css'
import OverviewTab from './OverviewTab.tsx'
import AgentesTab from './AgentesTab.tsx'
import CodigoTab from './CodigoTab.tsx'
import DeploysTab from './DeploysTab.tsx'
import SegurancaTab from './SegurancaTab.tsx'
import ConfigTab from './ConfigTab.tsx'
import LogsTab from './LogsTab.tsx'

export interface Agent {
  name: string
  emoji: string
  status: 'running' | 'idle'
  tasks: number
  lastAction: string
  time: string
}

export interface Project {
  name: string
  icon: string
  emoji: string
  desc: string
  framework: string
  branch: string
  status: string
  commits: number
  branches: number
  deploys: number
  uptime: string
  stack: string[]
  agents: Agent[]
  lcp: string
  fid: string
  cls: string
  ttfb: string
  lighthouse: number | null
  coverage: number
  securityScore: number
  accessibilityScore: number | null
  vulnerabilities: number
  dependencies: number
  outdated: number
}

const agentEmojiMap: Record<string, string> = {
  'Codex': '\ud83e\udd16',
  'QA Bot': '\ud83e\uddea',
  'Sentinel': '\ud83d\udee1\ufe0f',
  'Pipeline': '\u2699\ufe0f',
  'Scribe': '\ud83d\udcdd',
  'Analyst': '\ud83d\udcca',
}

const agentDetailsMap: Record<string, { status: 'running' | 'idle'; tasks: number; lastAction: string; time: string }> = {
  'Codex': { status: 'running', tasks: 124, lastAction: 'Refatorou componentes — performance +18%', time: '12 min' },
  'QA Bot': { status: 'running', tasks: 89, lastAction: 'Executou testes e2e — todos passaram', time: '25 min' },
  'Sentinel': { status: 'idle', tasks: 34, lastAction: 'Scan completo — 0 vulnerabilidades', time: '2h' },
  'Pipeline': { status: 'running', tasks: 156, lastAction: 'Deploy em production — sucesso', time: '1h' },
  'Scribe': { status: 'running', tasks: 167, lastAction: 'Atualizou docs de componentes', time: '30 min' },
  'Analyst': { status: 'idle', tasks: 45, lastAction: 'Gerou relatorio de metricas', time: '3h' },
}

const projectEmojiMap: Record<string, string> = {
  '#60a5fa': '\ud83c\udf10',
  '#10b981': '\u26a1',
  '#c026d3': '\ud83c\udfa8',
  '#f59e0b': '\ud83d\udce6',
  '#8b5cf6': '\ud83d\ude80',
}

const fallbackProject: Project = {
  name: 'Landing Page v2', icon: '#60a5fa', emoji: '\ud83c\udf10',
  desc: 'Redesign com animacoes Framer Motion e otimizacao de Core Web Vitals.',
  framework: 'Next.js 14', branch: 'main', status: 'active',
  commits: 247, branches: 8, deploys: 34, uptime: '99.99%',
  stack: ['React', 'TypeScript', 'Tailwind', 'Framer Motion', 'Vercel'],
  agents: [
    { name: 'Codex', emoji: '\ud83e\udd16', status: 'running', tasks: 124, lastAction: 'Refatorou Hero.tsx — performance +18%', time: '12 min' },
    { name: 'QA Bot', emoji: '\ud83e\uddea', status: 'running', tasks: 89, lastAction: 'Executou 47 testes e2e — todos passaram', time: '25 min' },
    { name: 'Sentinel', emoji: '\ud83d\udee1\ufe0f', status: 'idle', tasks: 34, lastAction: 'Scan completo — 0 vulnerabilidades', time: '2h' },
  ],
  lcp: '1.2s', fid: '12ms', cls: '0.02', ttfb: '89ms',
  lighthouse: 97, coverage: 94, securityScore: 100, accessibilityScore: 98,
  vulnerabilities: 0, dependencies: 42, outdated: 3,
}

function mapApiProjectToLocal(apiProject: NonNullable<ReturnType<typeof useProjectBySlug>['data']>): Project {
  return {
    name: apiProject.name,
    icon: apiProject.icon,
    emoji: projectEmojiMap[apiProject.icon] || '\ud83d\udcc1',
    desc: apiProject.desc,
    framework: apiProject.framework,
    branch: apiProject.branch,
    status: apiProject.status,
    commits: apiProject.commits,
    branches: Math.max(1, Math.floor(apiProject.commits / 30)),
    deploys: apiProject.deploys,
    uptime: apiProject.uptime,
    stack: apiProject.stack,
    agents: apiProject.agents.map(name => ({
      name,
      emoji: agentEmojiMap[name] || '\ud83e\udd16',
      ...(agentDetailsMap[name] || { status: 'idle' as const, tasks: 0, lastAction: 'Sem atividade recente', time: '-' }),
    })),
    lcp: '1.2s',
    fid: '12ms',
    cls: '0.02',
    ttfb: '89ms',
    lighthouse: 97,
    coverage: 94,
    securityScore: 100,
    accessibilityScore: 98,
    vulnerabilities: 0,
    dependencies: Math.max(10, apiProject.stack.length * 10),
    outdated: Math.floor(Math.random() * 5),
  }
}

export default function ProjetoDetalhe() {
  const { slug } = useParams<{ slug: string }>()
  const [activeTab, setActiveTab] = useState('overview')
  const { t } = useTranslation()
  const { data: apiProject, isLoading } = useProjectBySlug(slug || '')

  const tabs = [
    { key: 'overview', label: t('project.overview') },
    { key: 'agentes', label: t('project.agents') },
    { key: 'codigo', label: t('project.code') },
    { key: 'deploys', label: t('project.deploys') },
    { key: 'seguranca', label: t('project.security') },
    { key: 'config', label: t('project.config') },
    { key: 'logs', label: t('project.logs') },
  ]

  const project = useMemo(() => {
    if (apiProject) return mapApiProjectToLocal(apiProject)
    return fallbackProject
  }, [apiProject])

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab project={project} />
      case 'agentes': return <AgentesTab project={project} />
      case 'codigo': return <CodigoTab project={project} />
      case 'deploys': return <DeploysTab project={project} />
      case 'seguranca': return <SegurancaTab project={project} />
      case 'config': return <ConfigTab project={project} />
      case 'logs': return <LogsTab project={project} />
      default: return <OverviewTab project={project} />
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        {t('common.loading') || 'Carregando...'}
      </div>
    )
  }

  return (
    <>
      <div className={css.breadcrumb}>
        <Link to="/projetos">{t('projetoDetalhe.breadcrumbProjects')}</Link>
        <span className={css.breadcrumbSep}>/</span>
        <span>{project.name}</span>
      </div>

      <div className={css.projectHeaderCard}>
        <div className={css.projectHeaderLeft}>
          <div
            className={css.projectHeaderIcon}
            style={{ background: `${project.icon}15`, border: `1px solid ${project.icon}25` }}
          >
            {project.emoji}
          </div>
          <div className={css.projectHeaderInfo}>
            <h2>{project.name}</h2>
            <p>{project.desc}</p>
            <div className={css.projectStatusRow}>
              <span className={clsx(css.psBadge, css.psBadgeActive)}>
                <span className={css.dot} /> {project.status === 'active' ? t('common.active') : t('common.draft')}
              </span>
              <span className={css.psStackTag}>{project.framework}</span>
              <span className={css.psStackTag}>{project.branch}</span>
              {project.agents.map((a, i) => (
                <span key={i} className={css.psStackTag}>{a.emoji} {a.name}</span>
              ))}
            </div>
          </div>
        </div>
        <div className={css.projectHeaderMetrics}>
          <div className={css.projectMetric}><span className="val">{project.commits}</span><span className="lbl">{t('projects.commitsLabel')}</span></div>
          <div className={css.projectMetric}><span className="val">{project.branches}</span><span className="lbl">{t('projects.branchesLabel')}</span></div>
          <div className={css.projectMetric}><span className="val">{project.deploys}</span><span className="lbl">{t('projects.deploysLabel')}</span></div>
          <div className={css.projectMetric}><span className="val">{project.uptime}</span><span className="lbl">{t('projects.uptimeLabel')}</span></div>
        </div>
      </div>

      <div className={css.projectTabs}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={clsx(css.projectTab, activeTab === t.key && css.projectTabActive)}
            onClick={() => setActiveTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </>
  )
}
