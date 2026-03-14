import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as automationsService from '../services/automations.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { createAutomationSchema, updateAutomationSchema, listAutomationsSchema } from '../schemas/automations.schema.js'
import type { AppEnv } from '../types/context.js'

const automationsRouter = new Hono<AppEnv>()

automationsRouter.use('/*', authMiddleware)

// GET /api/automations
automationsRouter.get('/', zValidator('query', listAutomationsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('query')

  try {
    const result = await automationsService.list(user.workspaceId, input)
    return c.json(result)
  } catch (error) {
    console.error('List automations error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list automations' } }, 500)
  }
})

// POST /api/automations
automationsRouter.post('/', zValidator('json', createAutomationSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const automation = await automationsService.create(user.workspaceId, user.id, input)
    return c.json({ data: automation }, 201)
  } catch (error) {
    console.error('Create automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create automation' } }, 500)
  }
})

// GET /api/automations/:id
automationsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const automation = await automationsService.getById(id)
    return c.json({ data: automation })
  } catch (error: any) {
    if (error.message === 'Automation not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Automation not found' } }, 404)
    }
    console.error('Get automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get automation' } }, 500)
  }
})

// PUT /api/automations/:id
automationsRouter.put('/:id', zValidator('json', updateAutomationSchema), async (c) => {
  const id = c.req.param('id')
  const input = c.req.valid('json')

  try {
    const automation = await automationsService.update(id, input)
    return c.json({ data: automation })
  } catch (error: any) {
    if (error.message === 'Automation not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Automation not found' } }, 404)
    }
    console.error('Update automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update automation' } }, 500)
  }
})

// DELETE /api/automations/:id
automationsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await automationsService.remove(id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Automation not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Automation not found' } }, 404)
    }
    console.error('Delete automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete automation' } }, 500)
  }
})

// PATCH /api/automations/:id/toggle
automationsRouter.patch('/:id/toggle', async (c) => {
  const id = c.req.param('id')

  try {
    const automation = await automationsService.toggle(id)
    return c.json({ data: automation })
  } catch (error: any) {
    if (error.message === 'Automation not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Automation not found' } }, 404)
    }
    console.error('Toggle automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to toggle automation' } }, 500)
  }
})

// POST /api/automations/:id/trigger
automationsRouter.post('/:id/trigger', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await automationsService.trigger(id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Automation not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Automation not found' } }, 404)
    }
    console.error('Trigger automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger automation' } }, 500)
  }
})

// GET /api/automations/:id/history
automationsRouter.get('/:id/history', async (c) => {
  const id = c.req.param('id')
  const page = Number(c.req.query('page') || 1)
  const perPage = Number(c.req.query('perPage') || 20)

  try {
    const result = await automationsService.getHistory(id, page, perPage)
    return c.json(result)
  } catch (error) {
    console.error('Get automation history error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get history' } }, 500)
  }
})

// GET /api/automations/:id/runs
automationsRouter.get('/:id/runs', async (c) => {
  const id = c.req.param('id')
  const page = Number(c.req.query('page') || 1)
  const perPage = Number(c.req.query('perPage') || 20)

  try {
    const result = await automationsService.getHistory(id, page, perPage)
    return c.json(result)
  } catch (error) {
    console.error('Get automation runs error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get runs' } }, 500)
  }
})

// GET /api/automations/runs/:runId
automationsRouter.get('/runs/:runId', async (c) => {
  const runId = c.req.param('runId')

  try {
    const run = await automationsService.getRun(runId)
    return c.json({ data: run })
  } catch (error: any) {
    if (error.message === 'Run not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Run not found' } }, 404)
    }
    console.error('Get automation run error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get run' } }, 500)
  }
})

// POST /api/automations/runs/:runId/cancel
automationsRouter.post('/runs/:runId/cancel', async (c) => {
  const runId = c.req.param('runId')

  try {
    const result = await automationsService.cancelRun(runId)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Run not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Run not found' } }, 404)
    }
    if (error.message === 'Run is not running') {
      return c.json({ error: { code: 'INVALID_STATUS', message: 'Run is not running' } }, 400)
    }
    console.error('Cancel automation run error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel run' } }, 500)
  }
})

// POST /api/automations/:id/execute (alias for trigger)
automationsRouter.post('/:id/execute', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await automationsService.trigger(id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Automation not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Automation not found' } }, 404)
    }
    console.error('Execute automation error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to execute automation' } }, 500)
  }
})

export default automationsRouter
