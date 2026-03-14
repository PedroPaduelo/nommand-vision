import { db } from '../db/index.js'
import { tokenBlacklist } from '../db/schema/token-blacklist.js'
import { eq } from 'drizzle-orm'
import { hash as sha256Hash } from 'node:crypto'
import type { AppEnv } from '../types/context.js'

export class TokenBlacklistService {
  // Adiciona token à blacklist (para logout imediato ou revogação)
  async addToBlacklist(userId: string, token: string, tokenType: 'access' | 'refresh', expiresAt: Date, reason: 'logout' | 'revoked' = 'logout', revokedByIp?: string) {
    const tokenHash = this.hashToken(token)

    await db.insert(tokenBlacklist).values({
      tokenHash,
      userId,
      tokenType,
      reason,
      expiresAt,
      revokedByIp,
    }).onConflictDoNothing({ target: tokenBlacklist.tokenHash })
  }

  // Verifica se token está na blacklist
  async isBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token)

    const [existing] = await db
      .select()
      .from(tokenBlacklist)
      .where(eq(tokenBlacklist.tokenHash, tokenHash))
      .limit(1)

    return !!existing
  }

  // Remove tokens expirados da blacklist (cleanup)
  async cleanupExpired() {
    const now = new Date()
    await db.delete(tokenBlacklist)
      .where(eq(tokenBlacklist.expiresAt, now))
  }

  // Revoga todos os tokens de um usuário (útil para logout em todos dispositivos)
  async revokeAllUserTokens(userId: string) {
    // Não deleta, apenas marca como revogados
    await db.update(tokenBlacklist)
      .set({ reason: 'revoked' })
      .where(eq(tokenBlacklist.userId, userId))
  }

  // Hash do token para armazenamento (SHA-256)
  private hashToken(token: string): string {
    return sha256Hash(token).toString('hex')
  }
}

export const tokenBlacklistService = new TokenBlacklistService()
