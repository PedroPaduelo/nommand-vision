import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as logsService from '../services/logs.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { listLogsSchema, createLogSchema, createLogBatchSchema, searchLogsSchema, cleanupLogsSchema } from '../schemas/logs.schema.js'
import type { AppEnv } from '../types/context.js'

const logsRouter = new Hono<AppEnv>()

logsRouter.use('/*', authMiddleware)

logsRouter.get('/', zValidator('query', listLogsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('query')

  try {
    const result = await logsService.list(user.workspaceId, input)
    return c.json(result)
  } catch (error) {
    console.error('List logs error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list logs' } }, 500)
  }
})

logsRouter.get('/stats', async (c) => {
  const user = c.get('user')

  try {
    const data = await logsService.getStats(user.workspaceId)
    return c.json({ data })
  } catch (error) {
    console.error('Logs stats error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get log stats' } }, 500)
  }
})

logsRouter.get('/search', zValidator('query', searchLogsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('query')

  try {
    const result = await logsService.search(user.workspaceId, input)
    return c.json(result)
  } catch (error) {
    console.error('Logs search error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to search logs' } }, 500)
  }
})

logsRouter.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const log = await logsService.getById(user.workspaceId, id)
    return c.json({ data: log })
  } catch (error: any) {
    if (error.message === 'Log not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Log not found' } }, 404)
    }
    console.error('Get log error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get log' } }, 500)
  }
})

logsRouter.post('/', zValidator('json', createLogSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const log = await logsService.create(user.workspaceId, input)
    return c.json({ data: log }, 201)
  } catch (error) {
    console.error('Create log error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create log' } }, 500)
  }
})

logsRouter.post('/batch', zValidator('json', createLogBatchSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const result = await logsService.createBatch(user.workspaceId, input.logs)
    return c.json({ data: result }, 201)
  } catch (error) {
    console.error('Batch create logs error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to batch create logs' } }, 500)
  }
})

logsRouter.delete('/cleanup', zValidator('json', cleanupLogsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const result = await logsService.deleteOld(user.workspaceId, input.olderThanDays)
    return c.json({ data: result })
  } catch (error) {
    console.error('Cleanup logs error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to cleanup logs' } }, 500)
  }
})

export default logsRouter
