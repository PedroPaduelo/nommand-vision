import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'
import { workspaces } from './workspaces'

export const notificationTypeEnum = pgEnum('notification_type', [
  'deploy',
  'agent',
  'system',
  'alert',
  'billing',
])

export const notificationChannelEnum = pgEnum('notification_channel', ['in_app', 'email', 'push'])

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body'),
  type: notificationTypeEnum('type').notNull().default('system'),
  channel: notificationChannelEnum('channel').notNull().default('in_app'),
  read: boolean('read').notNull().default(false),
  link: varchar('link', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  inApp: boolean('in_app').notNull().default(true),
  email: boolean('email').notNull().default(false),
  push: boolean('push').notNull().default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
