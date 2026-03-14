import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as projectsService from '../services/projects.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { createProjectSchema, updateProjectSchema, listProjectsSchema } from '../schemas/projects.schema.js'
import type { AppEnv } from '../types/context.js'

const projectsRouter = new Hono<AppEnv>()

projectsRouter.use('/*', authMiddleware)

projectsRouter.get('/', zValidator('query', listProjectsSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('query')

  try {
    const result = await projectsService.listProjects(user.workspaceId, input)
    return c.json(result)
  } catch (error) {
    console.error('List projects error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' } }, 500)
  }
})

projectsRouter.get('/:slug', async (c) => {
  const user = c.get('user')
  const slug = c.req.param('slug')

  try {
    const project = await projectsService.getProjectBySlug(user.workspaceId, slug)
    return c.json({ data: project })
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
    }
    console.error('Get project error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get project' } }, 500)
  }
})

projectsRouter.post('/', zValidator('json', createProjectSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const project = await projectsService.createProject(user.workspaceId, user.id, input)
    return c.json({ data: project }, 201)
  } catch (error) {
    console.error('Create project error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } }, 500)
  }
})

projectsRouter.put('/:id', zValidator('json', updateProjectSchema), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const input = c.req.valid('json')

  try {
    const project = await projectsService.updateProject(user.workspaceId, id, input)
    return c.json({ data: project })
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
    }
    console.error('Update project error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' } }, 500)
  }
})

projectsRouter.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const result = await projectsService.deleteProject(user.workspaceId, id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
    }
    console.error('Delete project error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project' } }, 500)
  }
})

projectsRouter.get('/:id/stats', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const stats = await projectsService.getProjectStats(user.workspaceId, id)
    return c.json({ data: stats })
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
    }
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } }, 500)
  }
})

projectsRouter.get('/:id/activity', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  try {
    const activity = await projectsService.getProjectActivity(user.workspaceId, id)
    return c.json(activity)
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'Project not found' } }, 404)
    }
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get activity' } }, 500)
  }
})

export default projectsRouter
