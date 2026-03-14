import clsx from 'clsx'
import styles from './IconPicker.module.css'

interface IconPickerProps {
  options: string[]
  selected: string
  onChange: (val: string) => void
  className?: string
}

export function IconPicker({ options, selected, onChange, className }: IconPickerProps) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {options.map(emoji => (
        <button
          key={emoji}
          className={clsx(styles.item, selected === emoji && styles.selected)}
          onClick={() => onChange(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
