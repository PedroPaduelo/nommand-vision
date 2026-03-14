import clsx from 'clsx'
import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

export default function OverviewTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const timeline = [
    { icon: '\u2705', bg: 'rgba(34,197,94,.1)', title: `Deploy #${project.deploys} concluido em production`, desc: 'Build em 1.2s \u00b7 Todos os healthchecks passaram \u00b7 Zero downtime', agent: project.agents[1], time: '12 min' },
    { icon: '\ud83e\udd16', bg: 'rgba(234,179,8,.1)', title: project.agents[0].lastAction, desc: `Commit automatico em ${project.branch} \u00b7 PR #${142} criado`, agent: project.agents[0], time: project.agents[0].time },
    { icon: '\ud83e\uddea', bg: 'rgba(139,92,246,.1)', title: project.agents[1]?.lastAction || 'Testes executados', desc: `Cobertura de ${project.coverage}% \u00b7 Nenhuma regressao detectada`, agent: project.agents[1], time: project.agents[1]?.time || '30 min' },
    { icon: '\ud83d\udee1\ufe0f', bg: 'rgba(34,197,94,.1)', title: project.agents[2]?.lastAction || 'Security scan completo', desc: `${project.vulnerabilities} vulnerabilidades \u00b7 ${project.dependencies} dependencias analisadas`, agent: project.agents[2], time: project.agents[2]?.time || '2h' },
    { icon: '\ud83d\udd0d', bg: 'rgba(96,165,250,.1)', title: `Code review automatico em PR #${182}`, desc: '3 sugestoes de melhoria \u00b7 1 otimizacao de bundle size \u00b7 Aprovado', agent: { emoji: '\ud83d\udd0d', name: 'Reviewer' }, time: '4h' },
    { icon: '\ud83d\udcdd', bg: 'rgba(192,38,211,.1)', title: 'Documentacao atualizada automaticamente', desc: `README.md + CHANGELOG.md + 4 JSDoc atualizados \u00b7 PR #${163} merged`, agent: { emoji: '\ud83d\udcdd', name: 'Scribe' }, time: '6h' },
    { icon: '\ud83e\udd16', bg: 'rgba(234,179,8,.1)', title: 'Otimizacao de bundle: tree-shaking aplicado', desc: 'Bundle size reduzido em 14% \u00b7 Lazy loading adicionado', agent: { emoji: '\ud83e\udd16', name: 'Codex' }, time: '8h' },
    { icon: '\ud83e\uddea', bg: 'rgba(139,92,246,.1)', title: 'Gerou 8 novos testes unitarios', desc: 'Cobertura de edge cases em Hero.tsx e api.ts', agent: { emoji: '\ud83e\uddea', name: 'QA Bot' }, time: '12h' },
  ]

  const scores = [
    ...(project.lighthouse !== null ? [{ label: t('project.scoreLighthouse'), value: project.lighthouse, max: 100 }] : []),
    { label: t('project.scoreTestCoverage'), value: project.coverage, max: 100 },
    { label: t('project.scoreSecurity'), value: project.securityScore, max: 100 },
    ...(project.accessibilityScore !== null ? [{ label: t('project.scoreAccessibility'), value: project.accessibilityScore, max: 100 }] : []),
  ]

  const perfMetrics = project.lighthouse !== null
    ? [
        { label: 'LCP', value: project.lcp },
        { label: 'FID', value: project.fid },
        { label: 'CLS', value: project.cls },
        { label: 'TTFB', value: project.ttfb },
      ]
    : [
        { label: 'TTFB', value: project.ttfb },
        { label: t('project.p99Latency'), value: '128ms' },
        { label: t('project.reqPerSec'), value: '4.2K' },
        { label: t('project.errorRate'), value: '0.02%' },
      ]

  return (
    <div className={css.row2}>
      <div className={css.dCard} style={{ flex: 1 }}>
        <span className={css.dLabel}>{t('project.agentActivity')}</span>
        <div className={css.timeline} style={{ marginTop: '.5rem' }}>
          {timeline.map((item, i) => (
            <div key={i} className={css.timelineItem}>
              <div className={css.timelineIcon} style={{ background: item.bg }}>{item.icon}</div>
              <div className={css.timelineBody}>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
                <span className={css.timelineAgentTag}>{item.agent?.emoji} {item.agent?.name}</span>
              </div>
              <span className={css.timelineTime}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className={css.dCard}>
          <span className={css.dLabel}>{project.lighthouse !== null ? t('project.performance') : t('project.performanceApi')}</span>
          <div className={css.perfGrid} style={{ marginTop: '.8rem' }}>
            {perfMetrics.map((m, i) => (
              <div key={i} className={css.perfCard}>
                <span className={css.dLabel}>{m.label}</span>
                <span className={clsx(css.dBig, css.green)} style={{ fontSize: '1.4rem', marginTop: '.2rem' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('projects.stack')}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '.6rem' }}>
            {project.stack.map((s, i) => (
              <span key={i} className={css.dtag}>{s}</span>
            ))}
          </div>
        </div>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('project.scores')}</span>
          <div className={css.scoreBarRow}>
            {scores.map((s, i) => {
              const color = s.value >= 95 ? 'var(--green)' : 'var(--yellow)'
              return (
                <div key={i} className={css.scoreBarItem}>
                  <div className={css.scoreBarLabel}>
                    <span>{s.label}</span>
                    <span className={css.scoreBarValue} style={{ color }}>{s.value}/{s.max}</span>
                  </div>
                  <div className={css.insightBarWrap}>
                    <div className={css.insightBar} style={{ width: `${s.value}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
