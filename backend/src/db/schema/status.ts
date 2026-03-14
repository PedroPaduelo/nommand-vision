import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'

export const serviceTypeEnum = pgEnum('service_type', ['api', 'database', 'worker', 'external'])
export const serviceStatusEnum = pgEnum('service_status', ['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'])
export const incidentSeverityEnum = pgEnum('incident_severity', ['minor', 'major', 'critical'])
export const incidentStatusEnum = pgEnum('incident_status', ['investigating', 'identified', 'monitoring', 'resolved'])
export const checkStatusEnum = pgEnum('check_status', ['up', 'down', 'degraded'])

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  url: varchar('url', { length: 500 }),
  type: serviceTypeEnum('type').notNull().default('api'),
  status: serviceStatusEnum('status').notNull().default('operational'),
  responseTimeMs: integer('response_time_ms'),
  lastCheckAt: timestamp('last_check_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  severity: incidentSeverityEnum('severity').notNull().default('minor'),
  status: incidentStatusEnum('status').notNull().default('investigating'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const uptimeChecks = pgTable('uptime_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  status: checkStatusEnum('status').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  checkedAt: timestamp('checked_at').notNull().defaultNow(),
})
