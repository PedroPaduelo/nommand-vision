import { pgTable, uuid, varchar, timestamp, boolean, index } from 'drizzle-orm/pg-core'

export const tokenBlacklist = pgTable('token_blacklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull(),
  tokenType: varchar('token_type', { length: 20 }).notNull().default('access'), // 'access' | 'refresh'
  reason: varchar('reason', { length: 50 }).notNull().default('logout'), // 'logout' | 'expired' | 'revoked'
  expiresAt: timestamp('expires_at').notNull(), // quando o token original expiraria
  revokedAt: timestamp('revoked_at').notNull().defaultNow(),
  revokedByIp: varchar('revoked_by_ip', { length: 45 }),
}, (table) => ({
  userIdIdx: index('idx_token_blacklist_user_id').on(table.userId),
  tokenHashIdx: index('idx_token_blacklist_token_hash').on(table.tokenHash),
  expiresAtIdx: index('idx_token_blacklist_expires_at').on(table.expiresAt),
}))
