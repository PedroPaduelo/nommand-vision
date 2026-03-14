import { pgTable, uuid, varchar, timestamp, date, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { projects } from './projects';
import { users } from './users';
export const snapshotPeriodEnum = pgEnum('snapshot_period', ['daily', 'weekly', 'monthly']);
export const analyticsEvents = pgTable('analytics_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id'),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    eventData: jsonb('event_data').$type(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const dailyMetrics = pgTable('daily_metrics', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    deploysCount: integer('deploys_count').notNull().default(0),
    deploysSuccess: integer('deploys_success').notNull().default(0),
    deploysFailed: integer('deploys_failed').notNull().default(0),
    agentsRuns: integer('agents_runs').notNull().default(0),
    tokensUsed: integer('tokens_used').notNull().default(0),
    avgResponseTimeMs: integer('avg_response_time_ms').notNull().default(0),
    activeUsers: integer('active_users').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const analyticsSnapshots = pgTable('analytics_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    period: snapshotPeriodEnum('period').notNull(),
    metrics: jsonb('metrics').$type().notNull(),
    snapshotDate: date('snapshot_date').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
