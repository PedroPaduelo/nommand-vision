import { getMessages, getMessage, markRead, markUnread, archiveMessage, deleteMessage } from '../inbox.service'

describe('inbox.service', () => {
  it('getMessages returns array of messages', async () => {
    const result = await getMessages()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('from')
    expect(result[0]).toHaveProperty('subject')
    expect(result[0]).toHaveProperty('body')
    expect(result[0]).toHaveProperty('unread')
  })

  it('getMessages with "all" filter returns all messages', async () => {
    const all = await getMessages('all')
    const noFilter = await getMessages()
    expect(all.length).toBe(noFilter.length)
  })

  it('getMessages filters by unread', async () => {
    const result = await getMessages('unread')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(m => m.unread)).toBe(true)
  })

  it('getMessages filters by tag', async () => {
    const result = await getMessages('deploy')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(m => m.filters.includes('deploy'))).toBe(true)
  })

  it('getMessage returns a specific message', async () => {
    const msg = await getMessage(1)
    expect(msg).toBeDefined()
    expect(msg?.id).toBe(1)
    expect(msg?.from).toBe('Nommand CI')
  })

  it('getMessage returns undefined for non-existent id', async () => {
    const msg = await getMessage(9999)
    expect(msg).toBeUndefined()
  })

  it('markRead sets unread to false', async () => {
    const msg = await markRead(1)
    expect(msg).toBeDefined()
    expect(msg?.unread).toBe(false)
  })

  it('markUnread sets unread to true', async () => {
    const msg = await markUnread(1)
    expect(msg).toBeDefined()
    expect(msg?.unread).toBe(true)
  })

  it('archiveMessage removes message and returns true', async () => {
    const before = await getMessages()
    const lengthBefore = before.length
    const lastMsg = before[before.length - 1]
    const result = await archiveMessage(lastMsg.id)
    expect(result).toBe(true)
    const after = await getMessages()
    expect(after.length).toBe(lengthBefore - 1)
  })

  it('archiveMessage returns false for non-existent id', async () => {
    const result = await archiveMessage(9999)
    expect(result).toBe(false)
  })

  it('deleteMessage removes message and returns true', async () => {
    const before = await getMessages()
    const lengthBefore = before.length
    const lastMsg = before[before.length - 1]
    const result = await deleteMessage(lastMsg.id)
    expect(result).toBe(true)
    const after = await getMessages()
    expect(after.length).toBe(lengthBefore - 1)
  })

  it('deleteMessage returns false for non-existent id', async () => {
    const result = await deleteMessage(9999)
    expect(result).toBe(false)
  })
})
