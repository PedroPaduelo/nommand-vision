import clsx from 'clsx'
import styles from './ColorPicker.module.css'

interface ColorPickerProps {
  colors: string[]
  selected: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ colors, selected, onChange, className }: ColorPickerProps) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {colors.map(color => (
        <button
          key={color}
          className={clsx(styles.swatch, selected === color && styles.selected)}
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}
