import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types/context.js'

export const workspaceMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')

  if (!user || !user.workspaceId) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'No workspace context' } }, 401)
  }

  c.set('workspaceId', user.workspaceId)
  await next()
})
