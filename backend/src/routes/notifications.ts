import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as notificationsService from '../services/notifications.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { listNotificationsSchema, updatePreferencesSchema } from '../schemas/notifications.schema.js'
import type { AppEnv } from '../types/context.js'

const notificationsRouter = new Hono<AppEnv>()

notificationsRouter.use('/*', authMiddleware)

notificationsRouter.get('/', zValidator('query', listNotificationsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('query')

  try {
    const result = await notificationsService.list(user.id, input)
    return c.json(result)
  } catch (error) {
    console.error('List notifications error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list notifications' } }, 500)
  }
})

notificationsRouter.get('/unread-count', async (c) => {
  const user = c.get('user')

  try {
    const result = await notificationsService.getUnreadCount(user.id)
    return c.json({ data: result })
  } catch (error) {
    console.error('Unread count error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get unread count' } }, 500)
  }
})

notificationsRouter.get('/preferences', async (c) => {
  const user = c.get('user')

  try {
    const prefs = await notificationsService.getPreferences(user.id)
    return c.json({ data: prefs })
  } catch (error) {
    console.error('Get preferences error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get preferences' } }, 500)
  }
})

notificationsRouter.put('/preferences', zValidator('json', updatePreferencesSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const prefs = await notificationsService.updatePreferences(user.id, input)
    return c.json({ data: prefs })
  } catch (error) {
    console.error('Update preferences error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update preferences' } }, 500)
  }
})

notificationsRouter.patch('/:id/read', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const notification = await notificationsService.markRead(id, user.id)
    return c.json({ data: notification })
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } }, 404)
    }
    console.error('Mark read error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to mark as read' } }, 500)
  }
})

notificationsRouter.post('/read-all', async (c) => {
  const user = c.get('user')

  try {
    const result = await notificationsService.markAllRead(user.id)
    return c.json({ data: result })
  } catch (error) {
    console.error('Mark all read error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all as read' } }, 500)
  }
})

notificationsRouter.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const result = await notificationsService.remove(id, user.id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Notification not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } }, 404)
    }
    console.error('Delete notification error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete notification' } }, 500)
  }
})

export default notificationsRouter
