import { getNotifications, clearAll } from '../notifications.service'

describe('notifications.service', () => {
  it('getNotifications returns array of notifications', async () => {
    const result = await getNotifications()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('icon')
    expect(result[0]).toHaveProperty('iconColor')
    expect(result[0]).toHaveProperty('title')
    expect(result[0]).toHaveProperty('desc')
    expect(result[0]).toHaveProperty('unread')
  })

  it('getNotifications has some unread notifications', async () => {
    const result = await getNotifications()
    const unread = result.filter(n => n.unread)
    expect(unread.length).toBeGreaterThan(0)
  })

  it('clearAll marks all notifications as read', async () => {
    await clearAll()
    const result = await getNotifications()
    expect(result.every(n => n.unread === false)).toBe(true)
  })
})
