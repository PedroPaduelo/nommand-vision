import { describe, it, expect } from 'vitest'

describe('Test setup', () => {
  it('should work with vitest globals', () => {
    expect(true).toBe(true)
  })

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div')
    div.textContent = 'hello'
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
    document.body.removeChild(div)
  })
})
