import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'
import { users } from './users'

export const projectStatusEnum = pgEnum('project_status', ['active', 'draft'])
export const projectRoleEnum = pgEnum('project_role', ['Frontend', 'Backend', 'Design', 'Data'])

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 10 }),
  iconColor: varchar('icon_color', { length: 7 }),
  status: projectStatusEnum('status').notNull().default('active'),
  branch: varchar('branch', { length: 100 }),
  framework: varchar('framework', { length: 50 }),
  stack: jsonb('stack').$type<string[]>(),
  agentIds: jsonb('agent_ids').$type<string[]>(),
  role: projectRoleEnum('role'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
