import { pgTable, uuid, text, timestamp, pgEnum, jsonb, integer, varchar } from 'drizzle-orm/pg-core';
import { conversations } from './conversations';
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
    role: messageRoleEnum('role').notNull(),
    content: text('content').notNull(),
    tokensUsed: integer('tokens_used'),
    model: varchar('model', { length: 100 }),
    toolCalls: jsonb('tool_calls').$type(),
    attachments: jsonb('attachments').$type(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
