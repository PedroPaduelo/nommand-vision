import { db } from '../db/index.js'
import { logs } from '../db/schema/index.js'
import { eq, and, desc, sql, gte, lte, ilike } from 'drizzle-orm'
import type { ListLogsInput, CreateLogInput, SearchLogsInput } from '../schemas/logs.schema.js'

export async function list(workspaceId: string, input: ListLogsInput) {
  const conditions: any[] = [eq(logs.workspaceId, workspaceId)]

  if (input.level) {
    conditions.push(eq(logs.level, input.level))
  }
  if (input.projectId) {
    conditions.push(eq(logs.projectId, input.projectId))
  }
  if (input.agentId) {
    conditions.push(eq(logs.agentId, input.agentId))
  }
  if (input.source) {
    conditions.push(eq(logs.source, input.source))
  }
  if (input.from) {
    conditions.push(gte(logs.createdAt, new Date(input.from)))
  }
  if (input.to) {
    conditions.push(lte(logs.createdAt, new Date(input.to)))
  }

  const offset = (input.page - 1) * input.perPage

  const rows = await db
    .select()
    .from(logs)
    .where(and(...conditions))
    .orderBy(desc(logs.createdAt))
    .limit(input.perPage)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(logs)
    .where(and(...conditions))

  return {
    data: rows,
    meta: {
      total: Number(count),
      page: input.page,
      perPage: input.perPage,
    },
  }
}

export async function getById(workspaceId: string, id: string) {
  const [log] = await db
    .select()
    .from(logs)
    .where(and(eq(logs.workspaceId, workspaceId), eq(logs.id, id)))
    .limit(1)

  if (!log) {
    throw new Error('Log not found')
  }

  return log
}

export async function create(workspaceId: string, input: CreateLogInput) {
  const [log] = await db
    .insert(logs)
    .values({
      workspaceId,
      projectId: input.projectId,
      agentId: input.agentId,
      level: input.level,
      message: input.message,
      metadata: input.metadata,
      source: input.source,
      traceId: input.traceId,
    })
    .returning()

  return log
}

export async function createBatch(workspaceId: string, items: CreateLogInput[]) {
  const values = items.map((item) => ({
    workspaceId,
    projectId: item.projectId,
    agentId: item.agentId,
    level: item.level,
    message: item.message,
    metadata: item.metadata,
    source: item.source,
    traceId: item.traceId,
  }))

  const inserted = await db.insert(logs).values(values).returning()
  return { count: inserted.length }
}

export async function getStats(workspaceId: string) {
  const byLevel = await db
    .select({
      level: logs.level,
      count: sql<number>`count(*)`,
    })
    .from(logs)
    .where(eq(logs.workspaceId, workspaceId))
    .groupBy(logs.level)

  const bySource = await db
    .select({
      source: logs.source,
      count: sql<number>`count(*)`,
    })
    .from(logs)
    .where(eq(logs.workspaceId, workspaceId))
    .groupBy(logs.source)
    .orderBy(sql`count(*) desc`)
    .limit(20)

  return {
    byLevel: byLevel.map((r) => ({ level: r.level, count: Number(r.count) })),
    bySource: bySource.map((r) => ({ source: r.source || 'unknown', count: Number(r.count) })),
  }
}

export async function search(workspaceId: string, input: SearchLogsInput) {
  const offset = (input.page - 1) * input.perPage

  const rows = await db
    .select()
    .from(logs)
    .where(and(
      eq(logs.workspaceId, workspaceId),
      ilike(logs.message, `%${input.q}%`)
    ))
    .orderBy(desc(logs.createdAt))
    .limit(input.perPage)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(logs)
    .where(and(
      eq(logs.workspaceId, workspaceId),
      ilike(logs.message, `%${input.q}%`)
    ))

  return {
    data: rows,
    meta: {
      total: Number(count),
      page: input.page,
      perPage: input.perPage,
    },
  }
}

export async function deleteOld(workspaceId: string, olderThanDays: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - olderThanDays)

  const result = await db
    .delete(logs)
    .where(and(
      eq(logs.workspaceId, workspaceId),
      lte(logs.createdAt, cutoff)
    ))
    .returning({ id: logs.id })

  return { deleted: result.length }
}
