import { pgTable, uuid, varchar, timestamp, boolean, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'

export const roleEnum = pgEnum('role', ['Frontend', 'Backend', 'Design', 'Data', 'Admin'])
export const themeEnum = pgEnum('theme', ['dark', 'light'])
export const userPlanEnum = pgEnum('user_plan', ['free', 'pro', 'enterprise'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: roleEnum('role'),
  stack: jsonb('stack').$type<string[]>(),
  cpuLevel: integer('cpu_level'),
  onboarded: boolean('onboarded').notNull().default(false),
  theme: themeEnum('theme').notNull().default('dark'),
  tourDone: boolean('tour_done').notNull().default(false),
  plan: userPlanEnum('plan').notNull().default('free'),
  oauthProvider: varchar('oauth_provider', { length: 20 }),
  oauthId: varchar('oauth_id', { length: 255 }),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
