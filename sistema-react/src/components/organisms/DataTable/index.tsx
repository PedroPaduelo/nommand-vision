import { useState, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import styles from './DataTable.module.css'

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, any>[]
  searchable?: boolean
  className?: string
  pageSize?: number
}

const statusColors: Record<string, string> = {
  active: 'green',
  success: 'green',
  running: 'green',
  healthy: 'green',
  draft: 'muted',
  idle: 'muted',
  stopped: 'red',
  fail: 'red',
  error: 'red',
  building: 'yellow',
  warning: 'yellow',
}

export function DataTable({ columns, data, searchable, className, pageSize = 10 }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  function handleSort(key: string, sortable?: boolean) {
    if (!sortable) return
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    )
  }, [data, search, columns])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  function renderCell(col: Column, value: any) {
    if (col.key === 'status' && typeof value === 'string') {
      const colorClass = statusColors[value.toLowerCase()] ?? 'muted'
      return <span className={clsx(styles.statusBadge, styles[colorClass])}>{value}</span>
    }
    return String(value ?? '')
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      {searchable && (
        <div className={styles.searchRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={col.sortable ? styles.sortable : undefined}
                onClick={() => handleSort(col.key, col.sortable)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className={styles.sortArrow}>
                    {sortDir === 'asc' ? ' \u2191' : ' \u2193'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key}>{renderCell(col, row[col.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            &laquo; Prev
          </button>
          <span className={styles.pageInfo}>
            Page {safePage} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  )
}
