import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../lib/hash.js';
export async function getProfile(userId) {
    const [user] = await db
        .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        stack: users.stack,
        cpuLevel: users.cpuLevel,
        onboarded: users.onboarded,
        theme: users.theme,
        tourDone: users.tourDone,
        plan: users.plan,
        createdAt: users.createdAt,
    })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}
export async function updateProfile(userId, input) {
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
export async function changePassword(userId, input) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.passwordHash) {
        throw new Error('User not found');
    }
    const valid = await verifyPassword(input.oldPassword, user.passwordHash);
    if (!valid) {
        throw new Error('Invalid current password');
    }
    const passwordHash = await hashPassword(input.newPassword);
    await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, userId));
    return { success: true };
}
export async function completeOnboarding(userId) {
    const [user] = await db
        .update(users)
        .set({ onboarded: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
    if (!user) {
        throw new Error('User not found');
    }
    return { success: true, onboarded: true };
}
export async function completeTour(userId) {
    const [user] = await db
        .update(users)
        .set({ tourDone: true, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
    if (!user) {
        throw new Error('User not found');
    }
    return { success: true, tourDone: true };
}
export async function updateTheme(userId, input) {
    const [user] = await db
        .update(users)
        .set({ theme: input.theme, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
    if (!user) {
        throw new Error('User not found');
    }
    return { success: true, theme: user.theme };
}
export async function deleteAccount(userId) {
    await db.delete(users).where(eq(users.id, userId));
    return { success: true };
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
        createdAt: user.createdAt,
    };
}
