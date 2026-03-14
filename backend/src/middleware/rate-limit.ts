import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types/context.js'

const store = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key)
  }
}, 60_000)

export function rateLimit(opts: { windowMs?: number; max?: number } = {}) {
  const windowMs = opts.windowMs ?? 60_000
  const max = opts.max ?? 60

  return createMiddleware<AppEnv>(async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown'

    const key = `${ip}:${c.req.path}`
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }

    entry.count++

    if (entry.count > max) {
      c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return c.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        429
      )
    }

    await next()
  })
}

export const authRateLimit = rateLimit({ windowMs: 60_000, max: 10 })
export const apiRateLimit = rateLimit({ windowMs: 60_000, max: 120 })
