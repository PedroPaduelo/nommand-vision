import { getSettings, updateSettings, getIntegrations, toggleIntegration, generateApiKey, getApiKeys, getBilling } from '../settings.service'

describe('settings.service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getSettings returns settings object with expected shape', async () => {
    const result = await getSettings()
    expect(result).toHaveProperty('workspaceName')
    expect(result).toHaveProperty('region')
    expect(result).toHaveProperty('theme')
    expect(result).toHaveProperty('accentColor')
    expect(result).toHaveProperty('devMode')
    expect(result).toHaveProperty('autoSave')
    expect(result).toHaveProperty('animations')
    expect(result).toHaveProperty('font')
    expect(result).toHaveProperty('notifDeploy')
  })

  it('getSettings uses defaults when localStorage is empty', async () => {
    const result = await getSettings()
    expect(result.theme).toBe('dark')
    expect(result.accentColor).toBe('#6366f1')
    expect(result.region).toBe('sa-east-1')
    expect(result.fontSize).toBe('medium')
  })

  it('updateSettings persists theme to localStorage', async () => {
    const updated = await updateSettings({ theme: 'light' })
    expect(updated.theme).toBe('light')
    expect(localStorage.getItem('nexus_theme')).toBe('light')
  })

  it('updateSettings persists accentColor to localStorage', async () => {
    const updated = await updateSettings({ accentColor: '#ff0000' })
    expect(updated.accentColor).toBe('#ff0000')
    expect(localStorage.getItem('nexus_accent')).toBe('#ff0000')
  })

  it('getIntegrations returns array of integrations', async () => {
    const result = await getIntegrations()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('key')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('desc')
    expect(result[0]).toHaveProperty('connected')
  })

  it('toggleIntegration flips connected state', async () => {
    const before = await getIntegrations()
    const target = before[0]
    const originalConnected = target.connected
    const after = await toggleIntegration(target.key)
    const toggled = after.find(i => i.key === target.key)
    expect(toggled?.connected).toBe(!originalConnected)
  })

  it('generateApiKey returns a new API key', async () => {
    const result = await generateApiKey()
    expect(result).toHaveProperty('key')
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('date')
    expect(result.key).toMatch(/^nxs_live_/)
    expect(result.status).toBe('active')
    expect(result.date).toBe('agora')
  })

  it('getApiKeys returns array of API keys', async () => {
    const result = await getApiKeys()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('key')
    expect(result[0]).toHaveProperty('status')
    expect(result[0]).toHaveProperty('date')
  })

  it('getBilling returns billing data', async () => {
    const result = await getBilling()
    expect(result).toHaveProperty('plan')
    expect(result).toHaveProperty('price')
    expect(result).toHaveProperty('features')
    expect(result).toHaveProperty('nextPayment')
    expect(result).toHaveProperty('paymentMethod')
    expect(result).toHaveProperty('usage')
    expect(result.plan).toBe('Pro Plan')
    expect(result.price).toBe(29)
    expect(Array.isArray(result.features)).toBe(true)
    expect(Array.isArray(result.usage)).toBe(true)
    expect(result.usage[0]).toHaveProperty('label')
    expect(result.usage[0]).toHaveProperty('used')
    expect(result.usage[0]).toHaveProperty('total')
  })
})
