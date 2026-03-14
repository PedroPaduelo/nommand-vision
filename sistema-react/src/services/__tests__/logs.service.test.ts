import { generateLogEntry, getLogs, getAlerts } from '../logs.service'

describe('logs.service', () => {
  it('generateLogEntry returns a log entry with expected shape', () => {
    const entry = generateLogEntry()
    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('timestamp')
    expect(entry).toHaveProperty('level')
    expect(entry).toHaveProperty('source')
    expect(entry).toHaveProperty('message')
    expect(entry.id).toMatch(/^log-/)
    expect(['INFO', 'WARN', 'ERROR', 'DEBUG']).toContain(entry.level)
  })

  it('getLogs returns array of log entries', async () => {
    const result = await getLogs()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('level')
    expect(result[0]).toHaveProperty('message')
  })

  it('getLogs filters by level', async () => {
    const result = await getLogs({ level: 'ERROR' })
    expect(result.length).toBeGreaterThanOrEqual(0)
    if (result.length > 0) {
      expect(result.every(e => e.level === 'ERROR')).toBe(true)
    }
  })

  it('getLogs with ALL level returns all entries', async () => {
    const all = await getLogs({ level: 'ALL' })
    expect(all.length).toBe(50)
  })

  it('getLogs filters by search text', async () => {
    const result = await getLogs({ search: 'api' })
    if (result.length > 0) {
      expect(result.every(e =>
        e.message.toLowerCase().includes('api') ||
        e.source.toLowerCase().includes('api')
      )).toBe(true)
    }
  })

  it('getAlerts returns array of alerts', async () => {
    const result = await getAlerts()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('sev')
    expect(result[0]).toHaveProperty('title')
    expect(result[0]).toHaveProperty('desc')
    expect(result[0]).toHaveProperty('time')
    expect(['critical', 'warning', 'info', 'resolved']).toContain(result[0].sev)
  })
})
