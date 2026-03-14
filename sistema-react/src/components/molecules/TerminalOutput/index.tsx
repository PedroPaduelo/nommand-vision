import clsx from 'clsx'
import styles from './TerminalOutput.module.css'

interface TerminalLine {
  text: string
  type?: 'path' | 'output' | 'warn' | 'error' | 'success'
}

interface TerminalOutputProps {
  lines: TerminalLine[]
  showCursor?: boolean
  className?: string
}

export function TerminalOutput({ lines, showCursor, className }: TerminalOutputProps) {
  return (
    <div className={clsx(styles.terminal, className)}>
      {lines.map((line, i) => (
        <span key={i} className={clsx(styles.line, line.type ? styles[line.type] : styles.output)}>
          {line.text}
        </span>
      ))}
      {showCursor && <span className={styles.cursor} />}
    </div>
  )
}
