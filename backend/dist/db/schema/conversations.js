import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';
import { agents } from './agents';
export const conversations = pgTable('conversations', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 200 }).notNull().default('Nova conversa'),
    model: varchar('model', { length: 100 }).notNull().default('claude-sonnet-4-20250514'),
    pinned: boolean('pinned').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
