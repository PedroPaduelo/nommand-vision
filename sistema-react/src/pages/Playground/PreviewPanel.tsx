import { sanitizeHtml } from '@/utils/sanitize.ts'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Playground.module.css'

interface Props {
  previewHtml: string
}

export default function PreviewPanel({ previewHtml }: Props) {
  const { t } = useTranslation()
  return (
    <div className={css.pgPreview}>
      <div className={css.pgPreviewHeader}>
        <span>{t('playground.preview')}</span>
        <span className={css.pgHotReload}>{'\u26a1'} {t('playground.hotReload')}</span>
      </div>
      <div className={css.pgPreviewBody}>
        <div className={css.pgPreviewContent} dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewHtml) }} />
      </div>
    </div>
  )
}
