import { login, logout } from '../auth.service'

describe('auth.service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('login returns authenticated true and derived userName', async () => {
    const result = await login('john.doe@example.com', 'password')
    expect(result.authenticated).toBe(true)
    expect(result.userName).toBe('John')
  })

  it('login sets auth and user name in localStorage', async () => {
    await login('maria.silva@test.com', 'secret')
    expect(localStorage.getItem('nexus_auth')).toBe('true')
    expect(localStorage.getItem('nexus_user_name')).toBe('Maria')
  })

  it('login handles email without dots or hyphens', async () => {
    const result = await login('admin@test.com', 'pass')
    expect(result.userName).toBe('Admin')
  })

  it('logout sets auth to false in localStorage', async () => {
    await login('user@test.com', 'pass')
    expect(localStorage.getItem('nexus_auth')).toBe('true')
    await logout()
    expect(localStorage.getItem('nexus_auth')).toBe('false')
  })
})
