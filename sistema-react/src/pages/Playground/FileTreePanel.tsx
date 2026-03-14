import clsx from 'clsx'
import { useTranslation } from '@/hooks/useTranslation.ts'
import css from './Playground.module.css'

interface TreeFile {
  type: 'file' | 'folder'
  name: string
  indent: number
  icon?: string
  lang?: string
  open?: boolean
}

interface Props {
  files: TreeFile[]
  activeFile: string
  onFileClick: (name: string) => void
}

export default function FileTreePanel({ files, activeFile, onFileClick }: Props) {
  const { t } = useTranslation()
  return (
    <div className={css.pgTreePanel}>
      <div className={css.pgTreeHeader}>{t('playground.explorer')}</div>
      <div className={css.pgTreeBody}>
        {files.map((f, i) => {
          if (f.type === 'folder') {
            return (
              <div key={i} className={css.pgFolder} style={{ paddingLeft: 8 + (f.indent || 0) * 16 }}>
                {f.open ? '\u25be' : '\u25b8'} {f.name}/
              </div>
            )
          }
          return (
            <div
              key={i}
              className={clsx(css.pgFile, f.name === activeFile && css.pgFileActive)}
              style={{ paddingLeft: 12 + (f.indent || 0) * 16 }}
              onClick={() => onFileClick(f.name)}
            >
              <span className={css.pgFileIcon}>{f.icon || '\ud83d\udcc4'}</span> {f.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { TreeFile }
