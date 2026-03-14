import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';
export const triggerTypeEnum = pgEnum('trigger_type', ['schedule', 'webhook', 'event', 'manual']);
export const automations = pgTable('automations', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    triggerType: triggerTypeEnum('trigger_type').notNull(),
    triggerConfig: jsonb('trigger_config').$type(),
    actions: jsonb('actions').$type().notNull().default([]),
    enabled: boolean('enabled').notNull().default(true),
    lastRunAt: timestamp('last_run_at'),
    runCount: integer('run_count').notNull().default(0),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const automationRuns = pgTable('automation_runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    automationId: uuid('automation_id').notNull().references(() => automations.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('running'),
    triggeredBy: varchar('triggered_by', { length: 20 }).notNull().default('manual'),
    output: jsonb('output').$type(),
    error: text('error'),
    durationMs: integer('duration_ms'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
