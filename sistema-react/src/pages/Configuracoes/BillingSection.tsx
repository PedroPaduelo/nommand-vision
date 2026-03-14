import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import { useBilling } from '@/hooks/queries/useSettingsQueries.ts'
import css from './Configuracoes.module.css'

interface UsageItem {
  label: string
  used: number
  total: number
  unit: string
}

function UsageRow({ item }: { item: UsageItem }) {
  const { t } = useTranslation()
  const percent = Math.round((item.used / item.total) * 100)
  const barCls = percent >= 90 ? css.usageBarCritical : percent >= 70 ? css.usageBarWarn : css.usageBarOk
  const usedStr = item.unit ? `${item.used} ${item.unit}` : String(item.used)
  const totalStr = item.unit ? `${item.total} ${item.unit}` : String(item.total)
  const displayLabel = item.label.startsWith('config.') ? t(item.label) : item.label

  return (
    <div className={css.usageRow}>
      <div className={css.usageInfo}>
        <strong>{displayLabel}</strong>
        <span>{usedStr} {t('config.of')} {totalStr}</span>
      </div>
      <div className={css.usageBarWrap}>
        <div className={css.usageBarBg}>
          <div className={clsx(css.usageBarFill, barCls)} style={{ width: `${percent}%` }} />
        </div>
        <span className={css.usagePercent}>{percent}%</span>
      </div>
    </div>
  )
}

export default function BillingSection() {
  const { t } = useTranslation()
  const { data: billing, isLoading } = useBilling()

  if (isLoading) {
    return (
      <div className={css.settingsSection}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          {t('common.loading') || 'Carregando...'}
        </div>
      </div>
    )
  }

  const plan = billing?.plan ?? 'Pro Plan'
  const price = billing?.price ?? 29
  const features = billing?.features ?? ['Deploys ilimitados', '10 membros', '100 GB storage', 'Suporte prioritario']
  const usageData: UsageItem[] = billing?.usage ?? [
    { label: 'Storage', used: 23.4, total: 100, unit: 'GB' },
    { label: 'Bandwidth', used: 2.4, total: 5, unit: 'TB' },
    { label: 'config.usageMembers', used: 8, total: 10, unit: '' },
    { label: 'AI Tokens', used: 847, total: 1000, unit: 'K' },
  ]
  const nextPayment = billing?.nextPayment ?? '15 de Marco, 2026'
  const paymentMethod = billing?.paymentMethod ?? 'Visa ****4242'

  return (
    <div className={css.settingsSection}>
      <h3>{t('config.billing')}</h3>
      <p className={css.settingsSectionDesc}>{t('config.billingDesc')}</p>

      <div className={css.billingPlan}>
        <h4>{plan}</h4>
        <div className={css.billingPrice}>${price} <span>{t('config.perMonth')}</span></div>
        <div className={css.planFeatures}>
          {features.map((feat, i) => (
            <span key={i} className={css.planFeature}>{'\u2713'} {feat}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        <button className={css.btnPrimary} type="button">{t('config.upgradeEnterprise')}</button>
        <button className={css.btnSecondary} type="button">{t('config.managePayment')}</button>
      </div>

      <div className={css.settingsCard}>
        <div className={css.settingsCardTitle}>{t('config.currentUsage')}</div>
        {usageData.map(item => <UsageRow key={item.label} item={item} />)}
      </div>

      <div className={css.paymentInfo}>
        <div>
          <strong>{t('config.nextPayment')}</strong>
          <p>{nextPayment} {'\u2014'} {paymentMethod}</p>
        </div>
        <span className={css.paymentAmount}>${price.toFixed(2)}</span>
      </div>
    </div>
  )
}
