import { db } from '../db/index.js';
import { workspaceSettings, apiKeys, webhooks } from '../db/schema/settings.js';
import { eq, and } from 'drizzle-orm';
import { hashToken } from '../lib/hash.js';
import { randomBytes, createHash } from 'crypto';
// --- Settings ---
export async function getSettings(workspaceId) {
    const rows = await db
        .select()
        .from(workspaceSettings)
        .where(eq(workspaceSettings.workspaceId, workspaceId));
    const settings = {};
    for (const row of rows) {
        settings[row.key] = row.value;
    }
    return settings;
}
export async function updateSetting(workspaceId, key, value) {
    const [existing] = await db
        .select()
        .from(workspaceSettings)
        .where(and(eq(workspaceSettings.workspaceId, workspaceId), eq(workspaceSettings.key, key)))
        .limit(1);
    if (existing) {
        const [row] = await db
            .update(workspaceSettings)
            .set({ value, updatedAt: new Date() })
            .where(eq(workspaceSettings.id, existing.id))
            .returning();
        return { key: row.key, value: row.value };
    }
    const [row] = await db
        .insert(workspaceSettings)
        .values({ workspaceId, key, value })
        .returning();
    return { key: row.key, value: row.value };
}
// --- API Keys ---
export async function listApiKeys(workspaceId) {
    const rows = await db
        .select({
        id: apiKeys.id,
        name: apiKeys.name,
        prefix: apiKeys.prefix,
        permissions: apiKeys.permissions,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
    })
        .from(apiKeys)
        .where(eq(apiKeys.workspaceId, workspaceId));
    return rows;
}
export async function createApiKey(workspaceId, input) {
    const rawKey = 'nxs_' + randomBytes(32).toString('hex');
    const prefix = rawKey.slice(0, 8);
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const [row] = await db
        .insert(apiKeys)
        .values({
        workspaceId,
        name: input.name,
        keyHash,
        prefix,
        permissions: input.permissions,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    })
        .returning();
    return {
        id: row.id,
        name: row.name,
        key: rawKey,
        prefix: row.prefix,
        permissions: row.permissions,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
    };
}
export async function revokeApiKey(id) {
    const [row] = await db
        .delete(apiKeys)
        .where(eq(apiKeys.id, id))
        .returning();
    if (!row) {
        throw new Error('API key not found');
    }
    return { success: true };
}
// --- Webhooks ---
export async function listWebhooks(workspaceId) {
    const rows = await db
        .select({
        id: webhooks.id,
        name: webhooks.name,
        url: webhooks.url,
        events: webhooks.events,
        active: webhooks.active,
        lastTriggeredAt: webhooks.lastTriggeredAt,
        createdAt: webhooks.createdAt,
        updatedAt: webhooks.updatedAt,
    })
        .from(webhooks)
        .where(eq(webhooks.workspaceId, workspaceId));
    return rows;
}
export async function createWebhook(workspaceId, input) {
    const secretHash = input.secret ? hashToken(input.secret) : null;
    const [row] = await db
        .insert(webhooks)
        .values({
        workspaceId,
        name: input.name,
        url: input.url,
        events: input.events,
        secretHash,
    })
        .returning();
    return formatWebhook(row);
}
export async function updateWebhook(id, input) {
    const updateData = { updatedAt: new Date() };
    if (input.name !== undefined)
        updateData.name = input.name;
    if (input.url !== undefined)
        updateData.url = input.url;
    if (input.events !== undefined)
        updateData.events = input.events;
    if (input.active !== undefined)
        updateData.active = input.active;
    if (input.secret)
        updateData.secretHash = hashToken(input.secret);
    const [row] = await db
        .update(webhooks)
        .set(updateData)
        .where(eq(webhooks.id, id))
        .returning();
    if (!row) {
        throw new Error('Webhook not found');
    }
    return formatWebhook(row);
}
export async function deleteWebhook(id) {
    const [row] = await db
        .delete(webhooks)
        .where(eq(webhooks.id, id))
        .returning();
    if (!row) {
        throw new Error('Webhook not found');
    }
    return { success: true };
}
export async function testWebhook(id) {
    const [webhook] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, id))
        .limit(1);
    if (!webhook) {
        throw new Error('Webhook not found');
    }
    try {
        const res = await fetch(webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'webhook.test',
                timestamp: new Date().toISOString(),
                data: { message: 'Test webhook from Nommand Vision' },
            }),
        });
        await db
            .update(webhooks)
            .set({ lastTriggeredAt: new Date(), updatedAt: new Date() })
            .where(eq(webhooks.id, id));
        return {
            success: res.ok,
            status: res.status,
            message: res.ok ? 'Webhook test sent successfully' : 'Webhook returned an error',
        };
    }
    catch (error) {
        return {
            success: false,
            status: 0,
            message: error.message || 'Failed to reach webhook URL',
        };
    }
}
function formatWebhook(row) {
    return {
        id: row.id,
        name: row.name,
        url: row.url,
        events: row.events,
        active: row.active,
        lastTriggeredAt: row.lastTriggeredAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
