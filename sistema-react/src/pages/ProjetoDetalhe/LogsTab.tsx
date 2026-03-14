import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

export default function LogsTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const slug = project.name.toLowerCase().replace(/\s+/g, '-')

  const logLines = [
    { time: '14:32:01', level: 'INFO', color: 'var(--green)', text: 'Server started on port 3000' },
    { time: '14:32:02', level: 'INFO', color: 'var(--green)', text: 'Connected to database (sa-east-1)' },
    { time: '14:32:03', level: 'INFO', color: 'var(--green)', text: 'Redis cache connected' },
    { time: '14:32:05', level: 'AGENT', color: 'var(--purple)', text: 'Sentinel attached \u2014 watching for threats' },
    { time: '14:32:06', level: 'AGENT', color: 'var(--purple)', text: 'QA Bot attached \u2014 monitoring regressions' },
    { time: '14:32:15', level: 'HTTP', color: 'var(--neon)', text: 'GET /api/users 200 8ms' },
    { time: '14:32:16', level: 'HTTP', color: 'var(--neon)', text: 'GET /api/projects 200 12ms' },
    { time: '14:32:18', level: 'AGENT', color: 'var(--purple)', text: `Codex analyzing PR #${147}...` },
    { time: '14:32:19', level: 'AGENT', color: 'var(--green)', text: 'Codex: 2 suggestions, 1 optimization applied' },
    { time: '14:32:20', level: 'WARN', color: 'var(--yellow)', text: 'Memory usage at 72%' },
    { time: '14:32:22', level: 'HTTP', color: 'var(--neon)', text: 'POST /api/deploy 201 1.2s' },
    { time: '14:32:23', level: 'AGENT', color: 'var(--purple)', text: `Pipeline: deploy #${project.deploys} triggered` },
    { time: '14:32:25', level: 'AGENT', color: 'var(--green)', text: 'Pipeline: build passed, deploying to production' },
    { time: '14:32:27', level: 'AGENT', color: 'var(--green)', text: 'Sentinel: post-deploy scan \u2014 all clear' },
    { time: '14:32:30', level: 'INFO', color: 'var(--green)', text: 'Healthcheck: OK (11ms avg)' },
  ]

  return (
    <div className={css.dCard} style={{ minHeight: 400 }}>
      <span className={css.dLabel}>{t('project.logsTitle')}</span>
      <div className={css.fakeTerm} style={{ marginTop: '.5rem', minHeight: 350 }}>
        {logLines.map((l, i) => (
          <p key={i} style={{ color: '#555' }}>
            [{l.time}] <span style={{ color: l.color }}>{l.level}</span> {l.text}
          </p>
        ))}
        <p>
          <span className={css.tPath}>{slug}</span> $ <span className={css.blink}>|</span>
        </p>
      </div>
    </div>
  )
}
