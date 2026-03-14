import clsx from 'clsx'
import { SearchInput } from '@/components/molecules/SearchInput/index.tsx'
import styles from './FilterBar.module.css'

interface FilterItem {
  key: string
  label: string
  count?: number
}

interface FilterBarProps {
  filters: FilterItem[]
  activeFilter: string
  onFilterChange: (key: string) => void
  searchValue?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  className?: string
}

export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  className,
}: FilterBarProps) {
  return (
    <div className={clsx(styles.bar, className)}>
      {filters.map(f => (
        <button
          key={f.key}
          className={clsx(styles.btn, activeFilter === f.key && styles.active)}
          onClick={() => onFilterChange(f.key)}
        >
          {f.label}
          {f.count != null && <span className={styles.count}>{f.count}</span>}
        </button>
      ))}
      {onSearchChange && (
        <div className={styles.search}>
          <SearchInput
            value={searchValue ?? ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      )}
    </div>
  )
}
