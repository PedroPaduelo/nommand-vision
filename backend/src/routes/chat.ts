import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as chatService from '../services/chat.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { createSessionSchema, listSessionsSchema, sendMessageSchema } from '../schemas/chat.schema.js'
import type { AppEnv } from '../types/context.js'

const chatRouter = new Hono<AppEnv>()

chatRouter.use('/*', authMiddleware)

chatRouter.get('/sessions', zValidator('query', listSessionsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('query')

  try {
    const result = await chatService.listSessions(user.workspaceId, input)
    return c.json(result)
  } catch (error) {
    console.error('List sessions error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list sessions' } }, 500)
  }
})

chatRouter.get('/sessions/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const result = await chatService.getSession(user.workspaceId, id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Session not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404)
    }
    console.error('Get session error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get session' } }, 500)
  }
})

chatRouter.post('/sessions', zValidator('json', createSessionSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const session = await chatService.createSession(user.workspaceId, user.id, input)
    return c.json({ data: session }, 201)
  } catch (error) {
    console.error('Create session error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } }, 500)
  }
})

chatRouter.delete('/sessions/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const result = await chatService.deleteSession(user.workspaceId, id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Session not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404)
    }
    console.error('Delete session error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete session' } }, 500)
  }
})

chatRouter.post('/sessions/:id/messages', zValidator('json', sendMessageSchema), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const input = c.req.valid('json')

  try {
    const result = await chatService.sendMessage(user.workspaceId, user.id, id, input)
    return c.json({ data: result }, 201)
  } catch (error: any) {
    if (error.message === 'Session not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404)
    }
    console.error('Send message error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to send message' } }, 500)
  }
})

chatRouter.post('/sessions/:id/messages/stream', zValidator('json', sendMessageSchema), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const input = c.req.valid('json')

  try {
    const stream = await chatService.streamMessage(user.workspaceId, user.id, id, input)

    return c.body(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    if (error.message === 'Session not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, 404)
    }
    console.error('Stream message error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to stream message' } }, 500)
  }
})

export default chatRouter
