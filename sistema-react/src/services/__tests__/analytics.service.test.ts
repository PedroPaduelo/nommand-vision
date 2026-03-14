import { getMetrics, getEndpoints, getGeoData, getPeriodData } from '../analytics.service'

describe('analytics.service', () => {
  it('getMetrics returns metrics object for 7d period', async () => {
    const result = await getMetrics('7d')
    expect(result).toHaveProperty('totalRequests')
    expect(result).toHaveProperty('avgLatency')
    expect(result).toHaveProperty('errorRate')
    expect(result).toHaveProperty('uptime')
    expect(result.uptime).toBe('99.97%')
    expect(result.avgLatency).toMatch(/\d+ms/)
    expect(result.errorRate).toMatch(/[\d.]+%/)
  })

  it('getMetrics returns metrics for 30d period', async () => {
    const result = await getMetrics('30d')
    expect(result.totalRequests).toBeDefined()
    expect(result.avgLatency).toBeDefined()
  })

  it('getMetrics falls back to 30d for unknown period', async () => {
    const result = await getMetrics('unknown')
    expect(result).toHaveProperty('totalRequests')
    expect(result).toHaveProperty('uptime')
  })

  it('getEndpoints returns array of endpoints', async () => {
    const result = await getEndpoints()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('endpoint')
    expect(result[0]).toHaveProperty('requests')
    expect(result[0]).toHaveProperty('latency')
    expect(result[0]).toHaveProperty('error')
    expect(result[0]).toHaveProperty('status')
  })

  it('getGeoData returns array of geo entries', async () => {
    const result = await getGeoData()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('value')
    expect(result[0]).toHaveProperty('flag')
  })

  it('getPeriodData returns data with labels, requests, latency, errors', async () => {
    const result = await getPeriodData('7d')
    expect(result).toHaveProperty('labels')
    expect(result).toHaveProperty('requests')
    expect(result).toHaveProperty('latency')
    expect(result).toHaveProperty('errors')
    expect(Array.isArray(result.labels)).toBe(true)
    expect(result.labels.length).toBe(7)
    expect(result.requests.length).toBe(7)
  })

  it('getPeriodData falls back to 30d for unknown period', async () => {
    const result = await getPeriodData('unknown')
    expect(result.labels.length).toBe(30)
  })
})
