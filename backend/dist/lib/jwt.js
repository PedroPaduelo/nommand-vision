import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';
const accessTokenSecret = new TextEncoder().encode(env.JWT_SECRET);
const refreshTokenSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
export async function signAccessToken(payload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(accessTokenSecret);
}
export async function signRefreshToken(payload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(refreshTokenSecret);
}
export async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, accessTokenSecret);
    const payloadTyped = payload;
    return {
        userId: String(payloadTyped.userId),
        email: String(payloadTyped.email),
        workspaceId: String(payloadTyped.workspaceId),
    };
}
export async function verifyRefreshToken(token) {
    const { payload } = await jwtVerify(token, refreshTokenSecret);
    const payloadTyped = payload;
    return {
        userId: String(payloadTyped.userId),
        email: String(payloadTyped.email),
        workspaceId: String(payloadTyped.workspaceId),
    };
}
