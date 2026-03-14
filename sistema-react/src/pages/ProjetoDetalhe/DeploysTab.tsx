import clsx from 'clsx'
import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

interface Deploy {
  id: number
  status: 'success' | 'failed' | 'building'
  title: string
  desc: string
  time: string
  icon: string
  iconBg: string
}

function getDeploysForProject(project: Project): Deploy[] {
  const base = project.deploys
  return [
    { id: base, status: 'success', title: `Deploy #${base} \u2014 production`, desc: `${project.branch} \u00b7 Build 1.2s \u00b7 Pipeline`, time: '12 min atras', icon: '\u2705', iconBg: 'rgba(34,197,94,.1)' },
    { id: base - 1, status: 'success', title: `Deploy #${base - 1} \u2014 preview`, desc: `feat/new-hero \u00b7 Build 1.8s \u00b7 Pipeline`, time: '2h atras', icon: '\u2705', iconBg: 'rgba(34,197,94,.1)' },
    { id: base - 2, status: 'failed', title: `Deploy #${base - 2} \u2014 production`, desc: `${project.branch} \u00b7 Build failed \u00b7 TypeScript error`, time: '5h atras', icon: '\u274c', iconBg: 'rgba(239,68,68,.1)' },
    { id: base - 3, status: 'success', title: `Deploy #${base - 3} \u2014 staging`, desc: `develop \u00b7 Build 2.1s \u00b7 Pipeline`, time: '1d atras', icon: '\u2705', iconBg: 'rgba(34,197,94,.1)' },
    { id: base - 4, status: 'success', title: `Deploy #${base - 4} \u2014 production`, desc: `${project.branch} \u00b7 Build 1.4s \u00b7 Rollback`, time: '2d atras', icon: '\u2705', iconBg: 'rgba(34,197,94,.1)' },
  ]
}

function DeployRow({ deploy }: { deploy: Deploy }) {
  const { t } = useTranslation()
  const badgeCls = deploy.status === 'success'
    ? css.deploySuccess
    : deploy.status === 'failed'
    ? css.deployFailed
    : css.deployBuilding

  const label = deploy.status === 'success' ? t('deploys.statusSuccess') : deploy.status === 'failed' ? t('deploys.statusFail') : t('deploys.statusBuilding')

  return (
    <div className={css.deployRow}>
      <div className={css.deployIcon} style={{ background: deploy.iconBg }}>{deploy.icon}</div>
      <div className={css.deployInfo}>
        <strong>{deploy.title}</strong>
        <span>{deploy.desc}</span>
      </div>
      <span className={css.deployTime}>{deploy.time}</span>
      <span className={clsx(css.deployBadge, badgeCls)}>{label}</span>
    </div>
  )
}

export default function DeploysTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const deploys = getDeploysForProject(project)

  return (
    <>
      <div className={css.row3}>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('projetoDetalhe.totalDeploys')}</span>
          <span className={css.dBig}>{project.deploys}</span>
          <span className={css.dSub}>{t('project.managedByPipeline')}</span>
        </div>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('project.lastDeploy')}</span>
          <span className={clsx(css.dBig, css.green)}>{t('deploys.statusSuccess')}</span>
          <span className={css.dSub}>{'\u2699\ufe0f'} Pipeline {'\u00b7'} 12 min {t('projetoDetalhe.ago')}</span>
        </div>
        <div className={css.dCard}>
          <span className={css.dLabel}>{t('projects.uptimeLabel')}</span>
          <span className={clsx(css.dBig, css.green)}>{project.uptime}</span>
          <span className={css.dSub}>{t('project.monitoredBySentinel')}</span>
        </div>
      </div>
      <div className={css.dCard} style={{ padding: 0, overflow: 'hidden' }}>
        {deploys.map(d => <DeployRow key={d.id} deploy={d} />)}
      </div>
    </>
  )
}
