import { createMiddleware } from 'hono/factory'
import { randomUUID } from 'crypto'
import type { AppEnv } from '../types/context.js'

export const requestId = createMiddleware<AppEnv>(async (c, next) => {
  const id = c.req.header('x-request-id') || randomUUID()
  c.set('requestId', id)
  c.header('X-Request-Id', id)
  await next()
})
