import clsx from 'clsx'
import { sanitizeHtml } from '@/utils/sanitize.ts'
import styles from './CodePreview.module.css'

interface CodeLine {
  num: number
  content: string
}

interface CodePreviewProps {
  fileName: string
  lines: CodeLine[]
  className?: string
}

export function CodePreview({ fileName, lines, className }: CodePreviewProps) {
  return (
    <div className={clsx(styles.preview, className)}>
      <div className={styles.header}>
        <span>{fileName}</span>
      </div>
      <pre className={styles.body}>
        {lines.map((line) => (
          <div key={line.num} className={styles.line}>
            <span className={styles.lineNum}>{line.num}</span>
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(line.content) }} />
          </div>
        ))}
      </pre>
    </div>
  )
}
