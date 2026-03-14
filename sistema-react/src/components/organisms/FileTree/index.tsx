import clsx from 'clsx'
import styles from './FileTree.module.css'

interface FileItem {
  name: string
  type: 'file' | 'dir'
  indent?: number
  active?: boolean
}

interface FileTreeProps {
  items: FileItem[]
  onSelect?: (name: string) => void
  className?: string
}

export function FileTree({ items, onSelect, className }: FileTreeProps) {
  return (
    <div className={clsx(styles.tree, className)}>
      <div className={styles.header}>
        <span>Files</span>
      </div>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div
            key={i}
            className={clsx(styles.item, item.type === 'dir' && styles.dir, item.active && styles.active)}
            style={{ paddingLeft: `${16 + (item.indent ?? 0) * 16}px` }}
            onClick={() => onSelect?.(item.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelect?.(item.name) }}
          >
            <span className={styles.icon}>
              {item.type === 'dir' ? '\uD83D\uDCC1' : '\uD83D\uDCC4'}
            </span>
            <span className={styles.name}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
