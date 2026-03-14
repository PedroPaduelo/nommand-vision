import clsx from 'clsx'
import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

export default function AgentesTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const agentTimeline = [
    { emoji: project.agents[0].emoji, name: project.agents[0].name, action: project.agents[0].lastAction, detail: `Commit automatico em ${project.branch}`, time: project.agents[0].time, bg: 'rgba(234,179,8,.1)' },
    { emoji: '\ud83d\udd0d', name: 'Reviewer', action: `Code review automatico em PR #${147}`, detail: '3 sugestoes \u00b7 0 issues criticos \u00b7 Aprovado', time: '1h', bg: 'rgba(96,165,250,.1)' },
    { emoji: project.agents[1]?.emoji || '\ud83e\uddea', name: project.agents[1]?.name || 'QA Bot', action: project.agents[1]?.lastAction || 'Testes executados', detail: `Cobertura: ${project.coverage}% \u00b7 0 falhas`, time: project.agents[1]?.time || '2h', bg: 'rgba(139,92,246,.1)' },
    { emoji: '\u2699\ufe0f', name: 'Pipeline', action: `Deploy #${project.deploys} em production \u2014 sucesso`, detail: 'Build: 1.2s \u00b7 Zero downtime \u00b7 Rollback ready', time: '2h', bg: 'rgba(34,197,94,.1)' },
    { emoji: project.agents[2]?.emoji || '\ud83d\udee1\ufe0f', name: project.agents[2]?.name || 'Sentinel', action: project.agents[2]?.lastAction || 'Security scan', detail: `${project.vulnerabilities} vulnerabilidades \u00b7 ${project.dependencies} deps`, time: project.agents[2]?.time || '3h', bg: 'rgba(34,197,94,.1)' },
    { emoji: '\ud83d\udcdd', name: 'Scribe', action: 'CHANGELOG.md atualizado com ultimas mudancas', detail: '12 entries adicionadas \u00b7 Semantic versioning', time: '5h', bg: 'rgba(192,38,211,.1)' },
    { emoji: '\ud83e\udd16', name: 'Codex', action: 'Otimizacao de bundle: tree-shaking aplicado', detail: 'Bundle size reduzido em 14% \u00b7 Lazy loading adicionado', time: '8h', bg: 'rgba(234,179,8,.1)' },
    { emoji: '\ud83e\uddea', name: 'QA Bot', action: 'Gerou 8 novos testes unitarios', detail: 'Cobertura de edge cases em Hero.tsx e api.ts', time: '12h', bg: 'rgba(139,92,246,.1)' },
  ]

  return (
    <>
      <div className={css.projAgentsGrid}>
        {project.agents.map((a, i) => (
          <div key={i} className={css.projAgentCard}>
            <div className={css.projAgentTop}>
              <div className={css.projAgentName}><span className="emoji">{a.emoji}</span> {a.name}</div>
              <span className={clsx(css.projAgentStatus, a.status === 'running' ? css.projAgentStatusRunning : css.projAgentStatusIdle)}>{a.status === 'running' ? t('project.statusRunning') : t('project.statusIdle')}</span>
            </div>
            <div className={css.projAgentDesc}>{a.lastAction}</div>
            <div className={css.projAgentStats}>
              <span>{a.tasks} {t('project.tasksLabel')}</span>
              <span>{t('projetoDetalhe.lastAction')}: {a.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={css.dCard}>
        <span className={css.dLabel}>{t('project.agentHistory')}</span>
        <div className={css.timeline} style={{ marginTop: '.5rem' }}>
          {agentTimeline.map((e, i) => (
            <div key={i} className={css.timelineItem}>
              <div className={css.timelineIcon} style={{ background: e.bg }}>{e.emoji}</div>
              <div className={css.timelineBody}>
                <strong>{e.action}</strong>
                <p>{e.detail}</p>
                <span className={css.timelineAgentTag}>{e.emoji} {e.name}</span>
              </div>
              <span className={css.timelineTime}>{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
