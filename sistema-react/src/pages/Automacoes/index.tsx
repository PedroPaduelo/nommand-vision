import { useState, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import type { Workflow, WorkflowStep } from '@/types/index.ts'
import { MetricCard } from '@/components/molecules/MetricCard/index.tsx'
import { Sparkline } from '@/components/organisms/Sparkline/index.tsx'
import { Modal } from '@/components/molecules/Modal/index.tsx'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog/index.tsx'
import { Toggle } from '@/components/molecules/Toggle/index.tsx'
import { IconPicker } from '@/components/molecules/IconPicker/index.tsx'
import { useWorkflows, useCreateWorkflow, useToggleWorkflow, useDeleteWorkflow } from '@/hooks/queries/useAutomationQueries.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import styles from './Automacoes.module.css'

const WORKFLOW_TYPES = ['Build', 'Test', 'Deploy', 'Security', 'Performance', 'Integration', 'Notification', 'Custom']

const ICON_OPTIONS = [
  '\u{1F680}', '\u{1F50D}', '\u{1F6E1}\uFE0F', '\u{1F4BE}', '\u26A1', '\u{1F916}',
  '\u{1F9EA}', '\u{1F527}', '\u{1F4E6}', '\u{1F510}', '\u{1F4CA}', '\u{1F504}',
  '\u{1F3D7}\uFE0F', '\u{1F4CB}', '\u{1F4DD}', '\u2705', '\u{1F514}', '\u{1F30D}',
  '\u{1F4E5}', '\u{1F5DC}\uFE0F', '\u2601\uFE0F', '\u{1F4F8}', '\u{1F9F9}', '\u2728',
]

const STEP_SUGGESTIONS: WorkflowStep[] = [
  { icon: '\u{1F4E5}', label: 'Pull' },
  { icon: '\u{1F50D}', label: 'Lint' },
  { icon: '\u{1F9EA}', label: 'Test' },
  { icon: '\u{1F3D7}\uFE0F', label: 'Build' },
  { icon: '\u{1F680}', label: 'Deploy' },
  { icon: '\u{1F4CB}', label: 'PR Open' },
  { icon: '\u{1F916}', label: 'AI Scan' },
  { icon: '\u{1F4DD}', label: 'Comment' },
  { icon: '\u2705', label: 'Approve' },
  { icon: '\u{1F4E6}', label: 'Deps' },
  { icon: '\u{1F510}', label: 'SAST' },
  { icon: '\u{1F310}', label: 'DAST' },
  { icon: '\u{1F4CA}', label: 'Report' },
  { icon: '\u{1F4F8}', label: 'Snapshot' },
  { icon: '\u{1F5DC}\uFE0F', label: 'Compress' },
  { icon: '\u2601\uFE0F', label: 'Upload' },
  { icon: '\u{1F514}', label: 'Notify' },
  { icon: '\u{1F504}', label: 'Sync' },
  { icon: '\u{1F9F9}', label: 'Cleanup' },
  { icon: '\u{1F512}', label: 'Auth' },
]

interface FormState {
  name: string
  icon: string
  type: string
  desc: string
  steps: WorkflowStep[]
}

const EMPTY_FORM: FormState = { name: '', icon: '\u26A1', type: 'Custom', desc: '', steps: [] }

export default function Automacoes() {
  const { t } = useTranslation()
  const { data: workflows = [] } = useWorkflows()
  const createMutation = useCreateWorkflow()
  const toggleMutation = useToggleWorkflow()
  const deleteMutation = useDeleteWorkflow()

  const [localWorkflows, setLocalWorkflows] = useState<Workflow[] | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const sparkExec = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 50), [])
  const sparkSuccess = useMemo(() => Array.from({ length: 12 }, () => 95 + Math.random() * 5), [])
  const sparkTime = useMemo(() => Array.from({ length: 12 }, () => Math.random() * 5 + 1), [])

  const displayWorkflows = localWorkflows ?? workflows

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowCreate(true)
  }, [])

  const openEdit = useCallback((wf: Workflow) => {
    setForm({ name: wf.name, icon: wf.icon, type: wf.type, desc: wf.desc, steps: [...wf.steps] })
    setEditId(wf.id)
    setShowCreate(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowCreate(false)
    setEditId(null)
  }, [])

  function toggleStep(step: WorkflowStep) {
    setForm(prev => {
      const exists = prev.steps.find(s => s.label === step.label)
      if (exists) return { ...prev, steps: prev.steps.filter(s => s.label !== step.label) }
      return { ...prev, steps: [...prev.steps, step] }
    })
  }

  function removeStep(label: string) {
    setForm(prev => ({ ...prev, steps: prev.steps.filter(s => s.label !== label) }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) return

    if (editId) {
      setLocalWorkflows(prev => {
        const list = prev ?? [...workflows]
        return list.map(wf => wf.id === editId
          ? { ...wf, name: form.name, icon: form.icon, type: form.type, desc: form.desc, steps: form.steps }
          : wf
        )
      })
    } else {
      await createMutation.mutateAsync({
        name: form.name,
        icon: form.icon,
        type: form.type,
        desc: form.desc,
        steps: form.steps,
      })
    }
    closeModal()
  }

  async function handleToggle(id: string) {
    await toggleMutation.mutateAsync(id)
  }

  function handleDeleteConfirm() {
    if (!deleteId) return
    deleteMutation.mutate(deleteId)
    setLocalWorkflows(prev => {
      const list = prev ?? [...workflows]
      return list.filter(wf => wf.id !== deleteId)
    })
    setDeleteId(null)
  }

  const deleteTarget = displayWorkflows.find(w => w.id === deleteId)

  return (
    <div className={styles.page}>
      <div className={styles.metricsRow}>
        <MetricCard label={t('automacoes.activeWorkflows')} value={displayWorkflows.filter(w => w.active).length} green>
          <Sparkline data={[2, 3, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4]} color="var(--green)" />
        </MetricCard>
        <MetricCard label={t('automacoes.executions7d')} value="1.2K" sub={t('automacoes.vsPrevWeek')}>
          <Sparkline data={sparkExec} color="var(--neon)" />
        </MetricCard>
        <MetricCard label={t('automacoes.successRate')} value="98.5%" green>
          <Sparkline data={sparkSuccess} color="var(--green)" />
        </MetricCard>
        <MetricCard label={t('automacoes.avgTime')} value="3.2s" sub={t('automacoes.p95Value')}>
          <Sparkline data={sparkTime} color="var(--blue)" />
        </MetricCard>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>{t('automacoes.workflows')} ({displayWorkflows.length})</span>
        <button className={styles.createBtn} onClick={openCreate}>
          {t('automacoes.newWorkflow')}
        </button>
      </div>

      <div className={styles.workflowGrid}>
        {displayWorkflows.length === 0 && (
          <div className={styles.emptyGrid}>{t('automacoes.noWorkflows')}</div>
        )}
        {displayWorkflows.map(wf => (
          <div
            key={wf.id}
            className={clsx(styles.workflowCard, !wf.active && styles.workflowCardInactive)}
          >
            <div className={styles.workflowHeader}>
              <div className={styles.workflowHeaderLeft}>
                <span className={styles.workflowIcon}>{wf.icon}</span>
                <span className={styles.workflowName}>{wf.name}</span>
                <span className={styles.workflowTypeBadge}>{wf.type}</span>
              </div>
              <div className={styles.workflowHeaderRight}>
                <Toggle checked={wf.active} onChange={() => handleToggle(wf.id)} />
                <button className={styles.iconBtn} onClick={() => handleToggle(wf.id)} title={t('automacoes.run')}>
                  &#9654;
                </button>
                <button className={styles.iconBtn} onClick={() => openEdit(wf)} title={t('common.edit')}>
                  &#9998;
                </button>
                <button
                  className={clsx(styles.iconBtn, styles.iconBtnDanger)}
                  onClick={() => setDeleteId(wf.id)}
                  title={t('common.delete')}
                >
                  &#128465;
                </button>
              </div>
            </div>

            <div className={styles.workflowBody}>
              <div className={styles.workflowDesc}>{wf.desc}</div>
              <div className={styles.workflowPipeline}>
                {wf.steps.map((step, i) => (
                  <span key={step.label}>
                    <span className={styles.workflowStep}>
                      {step.icon} {step.label}
                    </span>
                    {i < wf.steps.length - 1 && (
                      <span className={styles.workflowArrow}> → </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.workflowFooter}>
              <div className={styles.footerStats}>
                <span className={styles.footerStat}>
                  {t('automacoes.exec')}: <span>{wf.executions}</span>
                </span>
                <span className={styles.footerStat}>
                  {t('automacoes.rate')}: <span>{wf.successRate}</span>
                </span>
                <span className={styles.footerStat}>
                  {t('automacoes.time')}: <span>{wf.avgTime}</span>
                </span>
                <span className={styles.footerStat}>
                  {t('automacoes.last')}: <span>{wf.lastRun}</span>
                </span>
              </div>
              <span
                className={clsx(styles.statusDot, wf.active ? styles.statusActive : styles.statusInactive)}
                title={wf.active ? t('automacoes.statusActive') : t('automacoes.statusInactive')}
              />
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showCreate}
        onClose={closeModal}
        title={editId ? t('automacoes.editWorkflow') : t('automacoes.newWorkflowTitle')}
        width="540px"
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{t('automacoes.name')}</label>
          <input
            className={styles.formInput}
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t('automacoes.namePlaceholder')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{t('automacoes.icon')}</label>
          <IconPicker
            options={ICON_OPTIONS}
            selected={form.icon}
            onChange={icon => setForm(f => ({ ...f, icon }))}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{t('automacoes.type')}</label>
          <select
            className={styles.formSelect}
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            {WORKFLOW_TYPES.map(wt => (
              <option key={wt} value={wt}>{wt}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{t('automacoes.description')}</label>
          <textarea
            className={styles.formTextarea}
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            placeholder={t('automacoes.descPlaceholder')}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{t('automacoes.stepsLabel')}</label>
          <div className={styles.stepsEditor}>
            {STEP_SUGGESTIONS.map(step => {
              const active = form.steps.some(s => s.label === step.label)
              return (
                <button
                  key={step.label}
                  className={clsx(styles.stepChip, active && styles.stepChipActive)}
                  onClick={() => toggleStep(step)}
                  type="button"
                >
                  {step.icon} {step.label}
                </button>
              )
            })}
          </div>
          {form.steps.length > 0 && (
            <div className={styles.pipelinePreview}>
              {form.steps.map((step, i) => (
                <span key={step.label}>
                  <span
                    className={styles.workflowStep}
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeStep(step.label)}
                    title={t('automacoes.clickToRemove')}
                  >
                    {step.icon} {step.label}
                    <span className={styles.stepRemove}>x</span>
                  </span>
                  {i < form.steps.length - 1 && (
                    <span className={styles.workflowArrow}> → </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={closeModal}>{t('common.cancel')}</button>
          <button
            className={styles.btnSubmit}
            onClick={handleSubmit}
            disabled={!form.name.trim()}
          >
            {editId ? t('common.save') : t('automacoes.createWorkflow')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={t('automacoes.deleteWorkflow')}
        message={t('automacoes.deleteConfirm', { name: deleteTarget?.name ?? '' })}
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
