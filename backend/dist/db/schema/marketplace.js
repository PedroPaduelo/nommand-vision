import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';
export const categoryEnum = pgEnum('category', ['agent', 'template', 'integration', 'plugin']);
export const marketplaceItems = pgTable('marketplace_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    author: varchar('author', { length: 100 }).notNull(),
    category: categoryEnum('category').notNull(),
    iconUrl: varchar('icon_url', { length: 500 }),
    bannerUrl: varchar('banner_url', { length: 500 }),
    version: varchar('version', { length: 20 }),
    downloads: integer('downloads').notNull().default(0),
    rating: decimal('rating', { precision: 3, scale: 2 }),
    tags: jsonb('tags').$type().default([]),
    configSchema: jsonb('config_schema').$type(),
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const marketplaceInstalls = pgTable('marketplace_installs', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id').notNull().references(() => marketplaceItems.id, { onDelete: 'cascade' }),
    config: jsonb('config').$type(),
    installedAt: timestamp('installed_at').notNull().defaultNow(),
    installedBy: uuid('installed_by').notNull().references(() => users.id),
});
