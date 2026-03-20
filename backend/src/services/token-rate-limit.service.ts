import { db } from '../db/index.js'
import { analyticsEvents, dailyMetrics } from '../db/schema/analytics.js'
import { eq, and, sql } from 'drizzle-orm'
import type { AppEnv } from '../types/context.js'

/**
 * Token Rate Limit Service
 * Controla custos de IA limitando tokens por workspace em janelas de tempo
 */
export class TokenRateLimitService {
  // Configurações de limite (tokens por minuto)
  private readonly WORKSPACE_TOKEN_LIMIT_PER_MINUTE = 50000
  private readonly USER_TOKEN_LIMIT_PER_MINUTE = 10000
  private readonly AGENT_TOKEN_LIMIT_PER_MINUTE = 20000

  // Cache em memória para limiting rápido
  private tokenUsageCache = new Map<string, { tokens: number; windowStart: number }>()

  /**
   * Verifica se o workspace pode usar X tokens agora
   */
  async canUseTokens(workspaceId: string, requestedTokens: number): Promise<{
    allowed: boolean
    remaining: number
    resetAt: number
    reason?: string
  }> {
    const now = Date.now()
    const windowSize = 60_000 // 1 minuto
    const cacheKey = `ws:${workspaceId}`

    // 1. Verificar cache
    const cached = this.tokenUsageCache.get(cacheKey)
    if (cached && now - cached.windowStart < windowSize) {
      const remaining = this.WORKSPACE_TOKEN_LIMIT_PER_MINUTE - (cached.tokens + requestedTokens)
      if (remaining < 0) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: cached.windowStart + windowSize,
          reason: 'Limite de tokens por minuto excedido (cache)',
        }
      }
      return {
        allowed: true,
        remaining,
        resetAt: cached.windowStart + windowSize,
      }
    }

    // 2. Consultar banco para uso real na janela atual
    const windowStart = now - (now % windowSize)
    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${analyticsEvents.eventData}->>'tokens')::int, 0)` })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.workspaceId, workspaceId),
          sql`${analyticsEvents.createdAt} >= from_timestamp(${windowStart / 1000})`,
          sql`${analyticsEvents.createdAt} < from_timestamp(${(windowStart + windowSize) / 1000})`,
          sql`${analyticsEvents.eventType} IN ('agent_run', 'chat_message')`,
        )
      )

    const usedTokens = result?.total || 0
    const remaining = this.WORKSPACE_TOKEN_LIMIT_PER_MINUTE - (usedTokens + requestedTokens)

    if (remaining < 0) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowStart + windowSize,
        reason: 'Limite de tokens por minuto excedido (DB)',
      }
    }

    // 3. Atualizar cache
    this.tokenUsageCache.set(cacheKey, {
      tokens: usedTokens + requestedTokens,
      windowStart,
    })

    return {
      allowed: true,
      remaining,
      resetAt: windowStart + windowSize,
    }
  }

  /**
   * Registra uso de tokens no analytics
   */
  async recordTokenUsage(
    workspaceId: string,
    userId: string,
    tokens: number,
    source: 'agent' | 'chat' | 'deploy',
    metadata?: Record<string, unknown>
  ) {
    await db.insert(analyticsEvents).values({
      workspaceId,
      userId,
      projectId: metadata?.projectId as string | null,
      agentId: metadata?.agentId as string | null,
      eventType: source === 'agent' ? 'agent_run' : 'chat_message',
      eventData: {
        tokens,
        source,
        metadata,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
    })
  }

  /**
   * Obtém uso atual de tokens no workspace
   */
  async getCurrentUsage(workspaceId: string): Promise<{
    tokensUsed: number
    tokensRemaining: number
    windowStart: number
    windowEnd: number
  }> {
    const now = Date.now()
    const windowSize = 60_000
    const windowStart = now - (now % windowSize)

    const [result] = await db
      .select({ total: sql<number>`COALESCE(SUM(${analyticsEvents.eventData}->>'tokens')::int, 0)` })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.workspaceId, workspaceId),
          sql`${analyticsEvents.createdAt} >= from_timestamp(${windowStart / 1000})`,
          sql`${analyticsEvents.createdAt} < from_timestamp(${(windowStart + windowSize) / 1000})`,
          sql`${analyticsEvents.eventType} IN ('agent_run', 'chat_message')`,
        )
      )

    const tokensUsed = result?.total || 0

    return {
      tokensUsed,
      tokensRemaining: Math.max(0, this.WORKSPACE_TOKEN_LIMIT_PER_MINUTE - tokensUsed),
      windowStart,
      windowEnd: windowStart + windowSize,
    }
  }

  /**
   * Limpa cache expirado
   */
  cleanupCache(): void {
    const now = Date.now()
    const windowSize = 60_000
    for (const [key, value] of this.tokenUsageCache.entries()) {
      if (now - value.windowStart >= windowSize) {
        this.tokenUsageCache.delete(key)
      }
    }
  }
}

// Limpeza automática a cada minuto
const tokenRateLimitService = new TokenRateLimitService()
setInterval(() => tokenRateLimitService.cleanupCache(), 60_000)

export { tokenRateLimitService }
