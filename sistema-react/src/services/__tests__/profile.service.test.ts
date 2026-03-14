import { getProfile, updateProfile, getContributions, getActivities, getSessions } from '../profile.service'

describe('profile.service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getProfile returns profile data with expected shape', async () => {
    const result = await getProfile()
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('bio')
    expect(result).toHaveProperty('handle')
    expect(result).toHaveProperty('initials')
    expect(result).toHaveProperty('role')
    expect(result).toHaveProperty('plan')
    expect(result).toHaveProperty('commits')
    expect(result).toHaveProperty('deploys')
    expect(result).toHaveProperty('stack')
    expect(Array.isArray(result.stack)).toBe(true)
  })

  it('getProfile uses defaults when localStorage is empty', async () => {
    const result = await getProfile()
    expect(result.name).toBe('Alex Johnson')
    expect(result.role).toBe('Frontend')
    expect(result.plan).toBe('Pro Plan')
  })

  it('getProfile reads from localStorage when set', async () => {
    localStorage.setItem('nexus_profile_name', 'Test User')
    localStorage.setItem('nexus_profile_bio', 'Test bio')
    localStorage.setItem('nexus_role', 'Backend')
    const result = await getProfile()
    expect(result.name).toBe('Test User')
    expect(result.bio).toBe('Test bio')
    expect(result.role).toBe('Backend')
  })

  it('updateProfile updates name and bio', async () => {
    const updated = await updateProfile({ name: 'New Name', bio: 'New Bio' })
    expect(updated.name).toBe('New Name')
    expect(updated.bio).toBe('New Bio')
    expect(localStorage.getItem('nexus_profile_name')).toBe('New Name')
    expect(localStorage.getItem('nexus_profile_bio')).toBe('New Bio')
  })

  it('getContributions returns array of 90 contributions', async () => {
    const result = await getContributions()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(90)
    expect(result[0]).toHaveProperty('count')
    expect(result[0]).toHaveProperty('date')
    expect(typeof result[0].count).toBe('number')
  })

  it('getActivities returns array of activities', async () => {
    const result = await getActivities()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('text')
    expect(result[0]).toHaveProperty('time')
    expect(result[0]).toHaveProperty('tag')
  })

  it('getActivities filters by tag', async () => {
    const result = await getActivities('deploy')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(a => a.tag === 'deploy')).toBe(true)
  })

  it('getSessions returns array of sessions', async () => {
    const result = await getSessions()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('device')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('current')
    expect(result.some(s => s.current)).toBe(true)
  })
})
