import { getServices, getIncidents, getGlobalStatus } from '../status.service'

describe('status.service', () => {
  it('getServices returns array of status services', async () => {
    const result = await getServices()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('uptime')
    expect(result[0]).toHaveProperty('status')
    expect(result[0]).toHaveProperty('desc')
  })

  it('getServices all have operational status', async () => {
    const result = await getServices()
    expect(result.every(s => s.status === 'operational')).toBe(true)
  })

  it('getIncidents returns array of incidents', async () => {
    const result = await getIncidents()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('title')
    expect(result[0]).toHaveProperty('severity')
    expect(result[0]).toHaveProperty('status')
    expect(result[0]).toHaveProperty('updates')
    expect(Array.isArray(result[0].updates)).toBe(true)
  })

  it('getIncidents filters by search term', async () => {
    const result = await getIncidents('database')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(inc =>
      inc.title.toLowerCase().includes('database') ||
      inc.updates.some(u => u.text.toLowerCase().includes('database'))
    )).toBe(true)
  })

  it('getIncidents returns all when no search given', async () => {
    const all = await getIncidents()
    const noSearch = await getIncidents(undefined)
    expect(all.length).toBe(noSearch.length)
  })

  it('getGlobalStatus returns status and uptime', async () => {
    const result = await getGlobalStatus()
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('uptime')
    expect(result.status).toBe('operational')
    expect(result.uptime).toMatch(/[\d.]+%/)
  })
})
