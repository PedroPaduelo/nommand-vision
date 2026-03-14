import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { users } from './users';
import { workspaces } from './workspaces';
export const deployEnvironmentEnum = pgEnum('deploy_environment', ['preview', 'staging', 'production']);
export const deployStatusEnum = pgEnum('deploy_status', ['queued', 'building', 'deploying', 'success', 'failed', 'cancelled']);
export const deployLogLevelEnum = pgEnum('deploy_log_level', ['info', 'warn', 'error']);
export const deploys = pgTable('deploys', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    environment: deployEnvironmentEnum('environment').notNull().default('preview'),
    status: deployStatusEnum('status').notNull().default('queued'),
    branch: varchar('branch', { length: 100 }),
    commitSha: varchar('commit_sha', { length: 40 }),
    commitMessage: text('commit_message'),
    logs: text('logs'),
    url: varchar('url', { length: 500 }),
    error: text('error'),
    durationMs: integer('duration_ms'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    triggeredBy: uuid('triggered_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
export const deployLogs = pgTable('deploy_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    deployId: uuid('deploy_id').notNull().references(() => deploys.id, { onDelete: 'cascade' }),
    level: deployLogLevelEnum('level').notNull().default('info'),
    message: text('message').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
});
export const deployEnvVars = pgTable('deploy_env_vars', {
    id: uuid('id').primaryKey().defaultRandom(),
    deployId: uuid('deploy_id').notNull().references(() => deploys.id, { onDelete: 'cascade' }),
    key: varchar('key', { length: 100 }).notNull(),
    valueEncrypted: text('value_encrypted').notNull(),
    isSecret: boolean('is_secret').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
