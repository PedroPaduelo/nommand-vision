import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
export const planEnum = pgEnum('plan', ['free', 'pro', 'enterprise']);
export const workspaces = pgTable('workspaces', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    ownerId: uuid('owner_id').notNull(),
    plan: planEnum('plan').notNull().default('free'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
