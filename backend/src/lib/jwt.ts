import { SignJWT, jwtVerify } from 'jose'
import { env } from '../config/env.js'
import { tokenBlacklistService } from '../services/token-blacklist.service.js'

const accessTokenSecret = new TextEncoder().encode(env.JWT_SECRET)
const refreshTokenSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)

export interface TokenPayload {
  userId: string
  email: string
  workspaceId: string
}

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  const { alg, typ } = { alg: 'HS256', typ: 'JWT' }
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg, typ })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(accessTokenSecret)
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  const { alg, typ } = { alg: 'HS256', typ: 'JWT' }
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg, typ })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(refreshTokenSecret)
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  // 1. Verificar se token está na blacklist (revogação imediata)
  const [_, rawPayload] = await jwtVerify(token, accessTokenSecret, { complete: true })
  if (rawPayload) {
    const payloadTyped = rawPayload as Record<string, unknown>
    const jti = payloadTyped.jti as string | undefined
    if (jti) {
      const isBlacklisted = await tokenBlacklistService.isBlacklisted(jti)
      if (isBlacklisted) {
        throw new Error('Token has been revoked')
      }
    }

    return {
      userId: String(payloadTyped.userId),
      email: String(payloadTyped.email),
      workspaceId: String(payloadTyped.workspaceId),
    }
  }

  // Fallback caso jwtVerify não retorne payload completo
  const { payload } = await jwtVerify(token, accessTokenSecret)
  return {
    userId: String(payload.userId),
    email: String(payload.email),
    workspaceId: String(payload.workspaceId),
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, refreshTokenSecret)
  return {
    userId: String(payload.userId),
    email: String(payload.email),
    workspaceId: String(payload.workspaceId),
  }
}
