import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types/context.js'

// Rate limit stores
const ipStore = new Map<string, { count: number; resetAt: number }>()
const workspaceStore = new Map<string, { count: number; resetAt: number }>()
const userStore = new Map<string, { count: number; resetAt: number }>()
const tokenStore = new Map<string, { count: number; resetAt: number }>()

// Limpar stores expirados a cada 60 segundos
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of ipStore) {
    if (val.resetAt < now) ipStore.delete(key)
  }
  for (const [key, val] of workspaceStore) {
    if (val.resetAt < now) workspaceStore.delete(key)
  }
  for (const [key, val] of userStore) {
    if (val.resetAt < now) userStore.delete(key)
  }
  for (const [key, val] of tokenStore) {
    if (val.resetAt < now) tokenStore.delete(key)
  }
}, 60_000)

// Taxa de requisições por workspace (evita DoS por workspace)
const WORKSPACE_RATE_LIMIT = 300 // 300 req/min por workspace
const USER_RATE_LIMIT = 120 // 120 req/min por usuário
const IP_RATE_LIMIT = 60 // 60 req/min por IP (fallback)

// Rate limit por IP (fallback - para rotas sem auth)
function checkIpRateLimit(ip: string, path: string, windowMs: number, max: number): boolean {
  const key = `${ip}:${path}`
  const now = Date.now()
  const entry = ipStore.get(key)

  if (!entry || entry.resetAt < now) {
    ipStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  entry.count++

  if (entry.count > max) {
    return false
  }

  return true
}

// Rate limit por workspace (proteção contra DoS de workspaces)
function checkWorkspaceRateLimit(workspaceId: string, windowMs: number, max: number): { allowed: boolean; remaining: number; resetAt: number } {
  const key = workspaceId
  const now = Date.now()
  const entry = workspaceStore.get(key)

  if (!entry || entry.resetAt < now) {
    workspaceStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++
  const remaining = Math.max(0, max - entry.count)

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining, resetAt: entry.resetAt }
}

// Rate limit por usuário autenticado
function checkUserRateLimit(userId: string, windowMs: number, max: number): { allowed: boolean; remaining: number; resetAt: number } {
  const key = userId
  const now = Date.now()
  const entry = userStore.get(key)

  if (!entry || entry.resetAt < now) {
    userStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++
  const remaining = Math.max(0, max - entry.count)

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining, resetAt: entry.resetAt }
}

// Função principal de rate limiting com múltiplas camadas
export function rateLimit(opts: {
  windowMs?: number
  max?: number
  byIp?: boolean
  byWorkspace?: boolean
  byUser?: boolean
} = {}) {
  const windowMs = opts.windowMs ?? 60_000
  const max = opts.max ?? 60
  const byIp = opts.byIp ?? true
  const byWorkspace = opts.byWorkspace ?? false
  const byUser = opts.byUser ?? false

  return createMiddleware<AppEnv>(async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
      || c.req.header('x-real-ip')
      || 'unknown'

    // 1. Rate limit por IP (sempre aplicável - fallback)
    if (byIp && !checkIpRateLimit(ip, c.req.path, windowMs, IP_RATE_LIMIT)) {
      c.header('Retry-After', '60')
      return c.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests from this IP' } },
        429
      )
    }

    // 2. Rate limit por workspace (se disponível)
    if (byWorkspace) {
      const workspaceId = c.get('workspaceId')
      if (workspaceId) {
        const wsResult = checkWorkspaceRateLimit(workspaceId, windowMs, WORKSPACE_RATE_LIMIT)
        c.header('X-Workspace-RateLimit-Remaining', String(wsResult.remaining))
        c.header('X-Workspace-RateLimit-Reset', String(Math.ceil((wsResult.resetAt - Date.now()) / 1000)))

        if (!wsResult.allowed) {
          c.header('Retry-After', String(Math.ceil((wsResult.resetAt - Date.now()) / 1000)))
          return c.json(
            { error: { code: 'WORKSPACE_RATE_LIMITED', message: 'Workspace rate limit exceeded' } },
            429
          )
        }
      }
    }

    // 3. Rate limit por usuário (se disponível)
    if (byUser) {
      const userId = c.get('user')?.id
      if (userId) {
        const userResult = checkUserRateLimit(userId, windowMs, USER_RATE_LIMIT)
        c.header('X-User-RateLimit-Remaining', String(userResult.remaining))
        c.header('X-User-RateLimit-Reset', String(Math.ceil((userResult.resetAt - Date.now()) / 1000)))

        if (!userResult.allowed) {
          c.header('Retry-After', String(Math.ceil((userResult.resetAt - Date.now()) / 1000)))
          return c.json(
            { error: { code: 'USER_RATE_LIMITED', message: 'User rate limit exceeded' } },
            429
          )
        }
      }
    }

    // 4. Rate limit genérico por IP + path (original)
    const key = `${ip}:${c.req.path}`
    const now = Date.now()
    const entry = ipStore.get(key)

    if (!entry || entry.resetAt < now) {
      ipStore.set(key, { count: 1, resetAt: now + windowMs })
    } else {
      entry.count++
      if (entry.count > max) {
        c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
        return c.json(
          { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
          429
        )
      }
    }

    await next()
  })
}

// Rate limits pré-configurados
export const authRateLimit = rateLimit({ windowMs: 60_000, max: 10, byIp: true })
export const apiRateLimit = rateLimit({ windowMs: 60_000, max: 120, byIp: true, byWorkspace: true, byUser: true })
export const workspaceRateLimit = rateLimit({ windowMs: 60_000, max: 300, byIp: false, byWorkspace: true })
export const agentRateLimit = rateLimit({ windowMs: 60_000, max: 30, byIp: false, byWorkspace: true, byUser: true })
