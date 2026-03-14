import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from '../DataTable/index.tsx'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
]

function makeRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@test.com`,
  }))
}

describe('DataTable', () => {
  it('renders table with correct number of rows', () => {
    const data = makeRows(5)
    render(<DataTable columns={columns} data={data} />)

    const rows = screen.getAllByRole('row')
    // 1 header row + 5 data rows
    expect(rows).toHaveLength(6)
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('User 5')).toBeInTheDocument()
  })

  it('search filters rows', () => {
    const data = [
      { name: 'Alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
      { name: 'Charlie', email: 'charlie@test.com' },
    ]
    render(<DataTable columns={columns} data={data} searchable />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'Bob' } })

    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
  })

  it('pagination controls work', () => {
    const data = makeRows(15)
    render(<DataTable columns={columns} data={data} pageSize={5} />)

    // Page 1: shows users 1-5
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('User 5')).toBeInTheDocument()
    expect(screen.queryByText('User 6')).not.toBeInTheDocument()
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()

    // Go to page 2
    fireEvent.click(screen.getByText(/Next/))
    expect(screen.getByText('User 6')).toBeInTheDocument()
    expect(screen.getByText('User 10')).toBeInTheDocument()
    expect(screen.queryByText('User 1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()

    // Go back to page 1
    fireEvent.click(screen.getByText(/Prev/))
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })
})
