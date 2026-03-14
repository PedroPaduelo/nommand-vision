import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'
import { projects } from './projects'

export const logLevelEnum = pgEnum('log_level', ['debug', 'info', 'warn', 'error', 'fatal'])

export const logs = pgTable('logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id'),
  level: logLevelEnum('level').notNull().default('info'),
  message: text('message').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  source: varchar('source', { length: 100 }),
  traceId: varchar('trace_id', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
