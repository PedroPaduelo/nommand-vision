import { useState } from 'react'
import clsx from 'clsx'
import type { Project } from './index.tsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './ProjetoDetalhe.module.css'

export default function ConfigTab({ project }: { project: Project }) {
  const { t } = useTranslation()
  const [autoDeploy, setAutoDeploy] = useState(true)
  const [previewDeploys, setPreviewDeploys] = useState(true)
  const [autoReview, setAutoReview] = useState(true)
  const [continuousScan, setContinuousScan] = useState(true)
  const [autoDocs, setAutoDocs] = useState(true)

  const toggles = [
    { label: t('project.autoDeploy'), desc: t('project.autoDeployDesc').replace('{branch}', project.branch), value: autoDeploy, set: setAutoDeploy },
    { label: t('project.previewDeploys'), desc: t('project.previewDeploysDesc'), value: previewDeploys, set: setPreviewDeploys },
    { label: t('project.autoCodeReview'), desc: t('project.autoCodeReviewDesc'), value: autoReview, set: setAutoReview },
    { label: t('project.continuousScan'), desc: t('project.continuousScanDesc'), value: continuousScan, set: setContinuousScan },
    { label: t('project.autoDocumentation'), desc: t('project.autoDocumentationDesc'), value: autoDocs, set: setAutoDocs },
  ]

  return (
    <div className={css.dCard}>
      <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>{t('project.projectSettings')}</h3>
      <div className={css.formGroup}>
        <label>{t('projects.projectName')}</label>
        <input type="text" className={css.formInput} defaultValue={project.name} />
      </div>
      <div className={css.formGroup}>
        <label>{t('projects.framework')}</label>
        <select className={css.formSelect} defaultValue={project.framework}>
          <option>Next.js 14</option>
          <option>Remix</option>
          <option>Vite + React</option>
          <option>Node.js + Apollo</option>
        </select>
      </div>
      <div className={css.formGroup}>
        <label>{t('projetos.nodeVersion')}</label>
        <select className={css.formSelect}>
          <option>20.x LTS</option>
          <option>18.x LTS</option>
        </select>
      </div>
      {toggles.map((t, i) => (
        <div key={i} className={css.settingsRow}>
          <div className={css.settingsRowLeft}>
            <strong>{t.label}</strong>
            <span>{t.desc}</span>
          </div>
          <button
            className={clsx(css.toggle, t.value && css.toggleOn)}
            onClick={() => t.set(!t.value)}
            type="button"
          />
        </div>
      ))}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '8px' }}>
        <button className={css.btnPrimary} type="button">{t('common.save')}</button>
        <button className={css.btnDanger} type="button">{t('project.deleteProject')}</button>
      </div>
    </div>
  )
}
