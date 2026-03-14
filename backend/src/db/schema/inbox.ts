import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'
import { users } from './users'
import { agents } from './agents'

export const inboxTypeEnum = pgEnum('inbox_type', ['info', 'warning', 'error', 'success', 'action'])

export const inboxMessages = pgTable('inbox_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  fromAgentId: uuid('from_agent_id').references(() => agents.id, { onDelete: 'set null' }),
  toUserId: uuid('to_user_id').references(() => users.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 200 }).notNull(),
  body: text('body'),
  type: inboxTypeEnum('type').notNull().default('info'),
  read: boolean('read').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  actionUrl: varchar('action_url', { length: 500 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
