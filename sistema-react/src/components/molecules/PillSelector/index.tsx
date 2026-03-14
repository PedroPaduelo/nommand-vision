import clsx from 'clsx'
import styles from './PillSelector.module.css'

interface PillSelectorProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multi?: boolean
  className?: string
}

export function PillSelector({ options, selected, onChange, multi, className }: PillSelectorProps) {
  function toggle(option: string) {
    if (multi) {
      const next = selected.includes(option)
        ? selected.filter(s => s !== option)
        : [...selected, option]
      onChange(next)
    } else {
      onChange(selected.includes(option) ? [] : [option])
    }
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      {options.map(opt => (
        <button
          key={opt}
          className={clsx(styles.pill, selected.includes(opt) && styles.selected)}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
