import { db } from '../db/index.js';
import { inboxMessages } from '../db/schema/index.js';
import { eq, and, desc, sql } from 'drizzle-orm';
export async function listInbox(workspaceId, input) {
    const conditions = [eq(inboxMessages.workspaceId, workspaceId)];
    if (input.type) {
        conditions.push(eq(inboxMessages.type, input.type));
    }
    if (input.read !== undefined) {
        conditions.push(eq(inboxMessages.read, input.read === 'true'));
    }
    if (input.archived !== undefined) {
        conditions.push(eq(inboxMessages.archived, input.archived === 'true'));
    }
    const offset = (input.page - 1) * input.perPage;
    const list = await db
        .select()
        .from(inboxMessages)
        .where(and(...conditions))
        .orderBy(desc(inboxMessages.createdAt))
        .limit(input.perPage)
        .offset(offset);
    const [{ count }] = await db
        .select({ count: sql `count(*)` })
        .from(inboxMessages)
        .where(and(...conditions));
    return {
        data: list.map(formatInboxItem),
        meta: {
            total: Number(count),
            page: input.page,
            perPage: input.perPage,
        },
    };
}
export async function getInbox(workspaceId, id) {
    const [item] = await db
        .select()
        .from(inboxMessages)
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.id, id)))
        .limit(1);
    if (!item) {
        throw new Error('Inbox item not found');
    }
    return formatInboxItem(item);
}
export async function markRead(workspaceId, id) {
    const [item] = await db
        .update(inboxMessages)
        .set({ read: true })
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.id, id)))
        .returning();
    if (!item) {
        throw new Error('Inbox item not found');
    }
    return formatInboxItem(item);
}
export async function markAllRead(workspaceId) {
    await db
        .update(inboxMessages)
        .set({ read: true })
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.read, false)));
    return { success: true };
}
export async function archiveItem(workspaceId, id) {
    const [item] = await db
        .update(inboxMessages)
        .set({ archived: true, read: true })
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.id, id)))
        .returning();
    if (!item) {
        throw new Error('Inbox item not found');
    }
    return formatInboxItem(item);
}
export async function unarchiveItem(workspaceId, id) {
    const [item] = await db
        .update(inboxMessages)
        .set({ archived: false })
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.id, id)))
        .returning();
    if (!item) {
        throw new Error('Inbox item not found');
    }
    return formatInboxItem(item);
}
export async function deleteItem(workspaceId, id) {
    const [item] = await db
        .delete(inboxMessages)
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.id, id)))
        .returning();
    if (!item) {
        throw new Error('Inbox item not found');
    }
    return { success: true };
}
export async function getUnreadCount(workspaceId) {
    const [{ count }] = await db
        .select({ count: sql `count(*)` })
        .from(inboxMessages)
        .where(and(eq(inboxMessages.workspaceId, workspaceId), eq(inboxMessages.read, false), eq(inboxMessages.archived, false)));
    return { unread: Number(count) };
}
function formatInboxItem(item) {
    return {
        id: item.id,
        workspaceId: item.workspaceId,
        fromAgentId: item.fromAgentId,
        toUserId: item.toUserId,
        type: item.type,
        subject: item.subject,
        body: item.body,
        read: item.read,
        archived: item.archived,
        actionUrl: item.actionUrl,
        metadata: item.metadata,
        createdAt: item.createdAt,
    };
}
