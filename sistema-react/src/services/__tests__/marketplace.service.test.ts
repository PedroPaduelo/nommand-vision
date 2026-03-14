import { getAgents, getCategories, installAgent, getRecommended } from '../marketplace.service'

describe('marketplace.service', () => {
  it('getAgents returns array of marketplace agents', async () => {
    const result = await getAgents()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('author')
    expect(result[0]).toHaveProperty('desc')
    expect(result[0]).toHaveProperty('stars')
    expect(result[0]).toHaveProperty('downloads')
    expect(result[0]).toHaveProperty('tags')
    expect(result[0]).toHaveProperty('category')
  })

  it('getAgents filters by category', async () => {
    const result = await getAgents('security')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(a => a.cat === 'security')).toBe(true)
  })

  it('getAgents filters by search term', async () => {
    const result = await getAgents(undefined, 'codex')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(a => a.name.toLowerCase().includes('codex'))).toBe(true)
  })

  it('getAgents includes installed flag', async () => {
    const result = await getAgents()
    const installed = result.filter(a => a.installed)
    expect(installed.length).toBeGreaterThan(0)
  })

  it('getCategories returns array with "all" as first entry', async () => {
    const result = await getCategories()
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toBe('all')
    expect(result.length).toBeGreaterThan(1)
  })

  it('installAgent returns true', async () => {
    const result = await installAgent('mkt-3')
    expect(result).toBe(true)
  })

  it('getRecommended returns agents for a role', () => {
    const result = getRecommended('Frontend')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(a => a.recommended.includes('Frontend'))).toBe(true)
  })

  it('getRecommended includes installed flag', () => {
    const result = getRecommended('Backend')
    expect(result[0]).toHaveProperty('installed')
  })
})
