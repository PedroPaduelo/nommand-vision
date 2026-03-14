import { db } from '../db/index.js';
import { users, sessions, workspaces } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { hashPassword, verifyPassword, hashToken } from '../lib/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}
export async function register(input) {
    const passwordHash = await hashPassword(input.password);
    const userId = crypto.randomUUID();
    const workspaceSlug = generateSlug(input.name);
    // Criar workspace com ownerId válido
    const [workspace] = await db
        .insert(workspaces)
        .values({
        id: crypto.randomUUID(),
        name: input.name + "'s Workspace",
        slug: workspaceSlug,
        ownerId: userId,
        plan: 'free',
    })
        .returning();
    // Criar usuário vinculado ao workspace
    const [user] = await db
        .insert(users)
        .values({
        id: userId,
        workspaceId: workspace.id,
        email: input.email,
        passwordHash,
        name: input.name,
        onboarded: false,
        theme: 'dark',
        tourDone: false,
        plan: 'free',
        emailVerified: false,
    })
        .returning();
    const payload = {
        userId: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);
    const refreshTokenHash = hashToken(refreshToken);
    await db.insert(sessions).values({
        userId: user.id,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return {
        user: formatUser(user),
        accessToken,
        refreshToken,
    };
}
export async function login(input) {
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    if (!user.passwordHash) {
        throw new Error('Please login with OAuth');
    }
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
        throw new Error('Invalid credentials');
    }
    const payload = {
        userId: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);
    const refreshTokenHash = hashToken(refreshToken);
    await db.insert(sessions).values({
        userId: user.id,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return {
        user: formatUser(user),
        accessToken,
        refreshToken,
    };
}
export async function logout(userId, refreshToken) {
    if (refreshToken) {
        const refreshTokenHash = hashToken(refreshToken);
        await db.delete(sessions).where(and(eq(sessions.userId, userId), eq(sessions.refreshTokenHash, refreshTokenHash)));
    }
    else {
        await db.delete(sessions).where(eq(sessions.userId, userId));
    }
}
export async function refresh(refreshToken) {
    const payload = await verifyRefreshToken(refreshToken);
    const refreshTokenHash = hashToken(refreshToken);
    const [session] = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.userId, payload.userId), eq(sessions.refreshTokenHash, refreshTokenHash)))
        .limit(1);
    if (!session) {
        throw new Error('Invalid refresh token');
    }
    if (session.expiresAt < new Date()) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
        throw new Error('Refresh token expired');
    }
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!user) {
        throw new Error('User not found');
    }
    const newPayload = {
        userId: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
    };
    const accessToken = await signAccessToken(newPayload);
    const newRefreshToken = await signRefreshToken(newPayload);
    const newRefreshTokenHash = hashToken(newRefreshToken);
    await db.delete(sessions).where(eq(sessions.id, session.id));
    await db.insert(sessions).values({
        userId: user.id,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}
export async function getMe(userId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
        throw new Error('User not found');
    }
    return formatUser(user);
}
export async function updateMe(userId, input) {
    const [user] = await db
        .update(users)
        .set({
        ...input,
        updatedAt: new Date(),
    })
        .where(eq(users.id, userId))
        .returning();
    if (!user) {
        throw new Error('User not found');
    }
    return formatUser(user);
}
function formatUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        stack: user.stack,
        cpuLevel: user.cpuLevel,
        onboarded: user.onboarded,
        theme: user.theme,
        tourDone: user.tourDone,
        plan: user.plan,
        authenticated: true,
    };
}
