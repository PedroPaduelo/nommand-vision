import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';
import { projects } from './projects';
export const agentStatusEnum = pgEnum('agent_status', ['active', 'inactive', 'error']);
export const agentCategoryEnum = pgEnum('agent_category', ['dev', 'review', 'qa', 'deploy', 'custom']);
export const agentTypeEnum = pgEnum('agent_type', ['assistant', 'custom', 'tool', 'supervisor']);
export const agentRunStatusEnum = pgEnum('agent_run_status', ['running', 'completed', 'error', 'timeout']);
export const agents = pgTable('agents', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    type: agentTypeEnum('type').notNull().default('custom'),
    model: varchar('model', { length: 50 }).notNull().default('claude-sonnet-4-20250514'),
    systemPrompt: text('system_prompt'),
    config: jsonb('config').$type(),
    temperature: varchar('temperature', { length: 5 }).default('0.7'),
    maxTokens: integer('max_tokens').notNull().default(4096),
    tools: jsonb('tools').$type().default([]),
    iconColor: varchar('icon_color', { length: 7 }),
    isActive: varchar('is_active', { length: 1 }).notNull().default('1'),
    status: agentStatusEnum('status').notNull().default('active'),
    category: agentCategoryEnum('category').notNull().default('custom'),
    statsTotalRuns: integer('stats_total_runs').notNull().default(0),
    statsAvgDurationMs: integer('stats_avg_duration_ms').notNull().default(0),
    statsSuccessRate: varchar('stats_success_rate', { length: 6 }).notNull().default('100'),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export const agentRuns = pgTable('agent_runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    input: text('input').notNull(),
    output: text('output'),
    tokensUsed: integer('tokens_used'),
    durationMs: integer('duration_ms'),
    status: agentRunStatusEnum('status').notNull().default('running'),
    error: text('error'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
