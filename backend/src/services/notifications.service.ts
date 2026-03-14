import { db } from '../db/index.js'
import { notifications, notificationPreferences } from '../db/schema/index.js'
import { eq, and, desc, sql } from 'drizzle-orm'
import { wsManager } from '../lib/ws-manager.js'
import type { ListNotificationsInput, CreateNotificationInput, UpdatePreferencesInput } from '../schemas/notifications.schema.js'

export async function list(userId: string, input: ListNotificationsInput) {
  const conditions: ReturnType<typeof eq>[] = [eq(notifications.userId, userId)]

  if (input.read !== undefined) {
    conditions.push(eq(notifications.read, input.read === 'true'))
  }
  if (input.type) {
    conditions.push(eq(notifications.type, input.type))
  }

  const offset = (input.page - 1) * input.perPage

  const list = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(input.perPage)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(...conditions))

  return {
    data: list.map(formatNotification),
    meta: {
      total: Number(count),
      page: input.page,
      perPage: input.perPage,
    },
  }
}

export async function markRead(id: string, userId: string) {
  const [notification] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning()

  if (!notification) {
    throw new Error('Notification not found')
  }

  return formatNotification(notification)
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

  return { success: true }
}

export async function remove(id: string, userId: string) {
  const [notification] = await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning()

  if (!notification) {
    throw new Error('Notification not found')
  }

  return { success: true }
}

export async function removeAll(userId: string) {
  await db.delete(notifications).where(eq(notifications.userId, userId))
  return { success: true }
}

export async function getUnreadCount(userId: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

  return { count: Number(count) }
}

export async function create(input: CreateNotificationInput) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      workspaceId: input.workspaceId,
      type: input.type as any,
      title: input.title,
      body: input.body,
    })
    .returning()

  const formatted = formatNotification(notification)

  wsManager.sendToUser(input.userId, 'notification', formatted)

  return formatted
}

export async function getPreferences(userId: string) {
  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))

  if (prefs.length === 0) {
    // Create default preferences for all types
    const defaultPrefs: Record<string, { inApp: boolean; email: boolean; push: boolean }> = {
      deploy: { inApp: true, email: false, push: true },
      agent: { inApp: true, email: false, push: true },
      system: { inApp: true, email: false, push: true },
      alert: { inApp: true, email: true, push: true },
      billing: { inApp: true, email: true, push: false },
    }

    const created = await db.insert(notificationPreferences).values(
      Object.entries(defaultPrefs).map(([type, channels]) => ({
        userId,
        type,
        inApp: channels.inApp,
        email: channels.email,
        push: channels.push,
      }))
    ).returning()

    return created.map(formatPreferences)
  }

  return prefs.map(formatPreferences)
}

export async function updatePreferences(userId: string, input: UpdatePreferencesInput) {
  const [pref] = await db
    .update(notificationPreferences)
    .set({
      inApp: input.inApp,
      email: input.email,
      push: input.push,
      updatedAt: new Date(),
    })
    .where(and(eq(notificationPreferences.userId, userId), eq(notificationPreferences.type, input.type)))
    .returning()

  if (!pref) {
    throw new Error('Preference not found')
  }

  return formatPreferences(pref)
}

function formatNotification(n: typeof notifications.$inferSelect) {
  return {
    id: n.id,
    workspaceId: n.workspaceId,
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    channel: n.channel,
    read: n.read,
    link: n.link,
    createdAt: n.createdAt,
  }
}

function formatPreferences(p: typeof notificationPreferences.$inferSelect) {
  return {
    type: p.type,
    inApp: p.inApp,
    email: p.email,
    push: p.push,
    updatedAt: p.updatedAt,
  }
}
