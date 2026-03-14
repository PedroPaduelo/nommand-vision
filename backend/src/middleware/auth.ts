import { createMiddleware } from 'hono/factory'
import { verifyAccessToken } from '../lib/jwt.js'
import { db } from '../db/index.js'
import { users } from '../db/schema/users.js'
import { eq } from 'drizzle-orm'
import type { AppEnv } from '../types/context.js'

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verifyAccessToken(token)

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)

    if (!user) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'User not found' } }, 401)
    }

    c.set('user', {
      id: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    })

    await next()
  } catch (error) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, 401)
  }
})
