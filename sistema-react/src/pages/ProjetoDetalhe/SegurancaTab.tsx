import clsx from 'clsx'
import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

export default function SegurancaTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const securityColor = project.securityScore >= 95 ? 'var(--green)' : 'var(--yellow)'

  const securityChecklist = [
    { status: 'check', text: t('projetoDetalhe.noSecretsExposed') },
    { status: 'check', text: t('projetoDetalhe.securityHeaders') },
    { status: 'check', text: t('projetoDetalhe.httpsForced') },
    { status: 'check', text: t('projetoDetalhe.rateLimitingActive') },
    project.vulnerabilities > 0
      ? { status: 'warn', text: t('projetoDetalhe.cveFound') }
      : { status: 'check', text: t('projetoDetalhe.noCves') },
    { status: 'check', text: t('projetoDetalhe.inputSanitization') },
  ]

  const qualityChecklist = [
    { status: 'check', text: t('projetoDetalhe.testCoverage').replace('{coverage}', String(project.coverage)) },
    { status: 'check', text: t('projetoDetalhe.zeroCodeSmells') },
    { status: 'check', text: t('projetoDetalhe.strictMode') },
    { status: 'check', text: t('projetoDetalhe.eslintPrettier') },
    project.outdated > 0
      ? { status: 'warn', text: t('projetoDetalhe.outdatedDeps').replace('{count}', String(project.outdated)) }
      : { status: 'check', text: t('projetoDetalhe.allDepsUpdated') },
    { status: 'check', text: t('projetoDetalhe.bundleOptimized') },
  ]

  return (
    <>
      <div className={css.row3}>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('project.securityScore')}</span>
          <span className={clsx(css.dBig, project.securityScore >= 95 && css.green)}>{project.securityScore}/100</span>
          <span className={css.dSub}>{'\ud83d\udee1\ufe0f'} {t('projetoDetalhe.sentinelScan')}</span>
        </div>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('project.vulnerabilities')}</span>
          <span className={clsx(css.dBig, project.vulnerabilities === 0 && css.green)}>{project.vulnerabilities}</span>
          <span className={css.dSub}>{project.vulnerabilities === 0 ? t('project.noVulnerabilities') : t('project.actionRecommended')}</span>
        </div>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('project.dependencies')}</span>
          <span className={css.dBig}>{project.dependencies}</span>
          <span className={css.dSub}>{t('project.outdated').replace('{count}', String(project.outdated))}</span>
        </div>
      </div>
      <div className={css.row2}>
        <div className={css.insightCard}>
          <div className={css.insightHeader}>
            <h4>{'\ud83d\udee1\ufe0f'} {t('project.securityAnalysis')}</h4>
            <span className={css.insightScore} style={{ color: securityColor }}>{project.securityScore}/100</span>
          </div>
          <div className={css.insightBarWrap}>
            <div className={css.insightBar} style={{ width: `${project.securityScore}%`, background: securityColor }} />
          </div>
          <div className={css.insightItems}>
            {securityChecklist.map((item, i) => (
              <div key={i} className={css.insightItem}>
                <span className={item.status === 'check' ? css.check : css.warn}>{item.status === 'check' ? '\u2713' : '\u26a0'}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
        <div className={css.insightCard}>
          <div className={css.insightHeader}>
            <h4>{'\ud83e\uddea'} {t('project.codeQuality')}</h4>
            <span className={css.insightScore} style={{ color: 'var(--green)' }}>{project.coverage}%</span>
          </div>
          <div className={css.insightBarWrap}>
            <div className={css.insightBar} style={{ width: `${project.coverage}%`, background: 'var(--green)' }} />
          </div>
          <div className={css.insightItems}>
            {qualityChecklist.map((item, i) => (
              <div key={i} className={css.insightItem}>
                <span className={item.status === 'check' ? css.check : css.warn}>{item.status === 'check' ? '\u2713' : '\u26a0'}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
