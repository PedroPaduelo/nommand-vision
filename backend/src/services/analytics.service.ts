import { db } from '../db/index.js'
import { analyticsEvents, dailyMetrics } from '../db/schema/index.js'
import { projects } from '../db/schema/index.js'
import { eq, and, desc, sql, gte, lte, isNull, between } from 'drizzle-orm'
import type { TrackEventInput, TimeseriesInput, DashboardInput } from '../schemas/analytics.schema.js'

const DAYS_BY_PERIOD = { '7d': 7, '30d': 30, '90d': 90 }

export async function getDashboard(workspaceId: string, input: DashboardInput) {
  const days = DAYS_BY_PERIOD[input.period] || 30
  const since = new Date()
  since.setDate(since.getDate() - days)

  // Aggregate from analytics_events (or daily_metrics if available)
  const [deploysTotal] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'deploy'),
      gte(analyticsEvents.createdAt, since)
    ))

  const [deploysSuccess] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'deploy'),
      gte(analyticsEvents.createdAt, since),
      sql`${analyticsEvents.eventData}->>'status' = 'success'`
    ))

  const [deploysFailed] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'deploy'),
      gte(analyticsEvents.createdAt, since),
      sql`${analyticsEvents.eventData}->>'status' = 'failed'`
    ))

  const [messagesTotal] = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'message'),
      gte(analyticsEvents.createdAt, since)
    ))

  // Calculate avg response time from daily_metrics if available
  const [avgResponse] = await db
    .select({ avg: sql<number>`avg(avg_response_time_ms)` })
    .from(dailyMetrics)
    .where(and(
      eq(dailyMetrics.workspaceId, workspaceId),
      between(dailyMetrics.date, since.toISOString().split('T')[0], new Date().toISOString().split('T')[0])
    ))

  // Active agents (distinct count from events)
  const [activeAgents] = await db
    .select({ count: sql<number>`count(distinct ${analyticsEvents.agentId})` })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'agent_action'),
      gte(analyticsEvents.createdAt, since)
    ))

  return {
    period: input.period,
    deploys: {
      total: Number(deploysTotal.count),
      success: Number(deploysSuccess.count),
      failed: Number(deploysFailed.count),
      success_rate: deploysTotal.count > 0 ? Math.round((Number(deploysSuccess.count) / Number(deploysTotal.count)) * 100) : 0,
    },
    agents: {
      active: Number(activeAgents.count),
    },
    messages: {
      total: Number(messagesTotal.count),
    },
    performance: {
      avg_response_time_ms: avgResponse.avg ? Math.round(avgResponse.avg) : 0,
    },
  }
}

export async function getTimeSeries(workspaceId: string, input: TimeseriesInput) {
  const days = input.period === '7d' ? 7 : input.period === '30d' ? 30 : 90
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await db
    .select({
      date: sql<string>`date(${analyticsEvents.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, input.metric),
      gte(analyticsEvents.createdAt, since)
    ))
    .groupBy(sql`date(${analyticsEvents.createdAt})`)
    .orderBy(sql`date(${analyticsEvents.createdAt})`)

  return rows.map((r) => ({ date: r.date, value: Number(r.count) }))
}

export async function trackEvent(workspaceId: string, userId: string | null, input: TrackEventInput) {
  const [event] = await db
    .insert(analyticsEvents)
    .values({
      workspaceId,
      projectId: input.projectId,
      eventType: input.eventType,
      eventData: input.eventData || {},
      userId,
    })
    .returning()

  return event
}

export async function getTopProjects(workspaceId: string) {
  const rows = await db
    .select({
      projectId: analyticsEvents.projectId,
      name: projects.name,
      slug: projects.slug,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .innerJoin(projects, eq(analyticsEvents.projectId, projects.id))
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      sql`${analyticsEvents.projectId} is not null`,
      isNull(projects.deletedAt)
    ))
    .groupBy(analyticsEvents.projectId, projects.name, projects.slug)
    .orderBy(sql`count(*) desc`)
    .limit(10)

  return rows.map((r) => ({
    projectId: r.projectId,
    name: r.name,
    slug: r.slug,
    events: Number(r.count),
  }))
}

export async function getTopAgents(workspaceId: string) {
  const rows = await db
    .select({
      agentId: sql<string>`${analyticsEvents.eventData}->>'agent_id'`,
      agentName: sql<string>`${analyticsEvents.eventData}->>'agent_name'`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'agent_action')
    ))
    .groupBy(sql`${analyticsEvents.eventData}->>'agent_id'`, sql`${analyticsEvents.eventData}->>'agent_name'`)
    .orderBy(sql`count(*) desc`)
    .limit(10)

  return rows.map((r) => ({
    agentId: r.agentId,
    agentName: r.agentName || 'Unknown',
    actions: Number(r.count),
  }))
}

export async function getDeployTrends(workspaceId: string, period: string = '30d') {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await db
    .select({
      date: sql<string>`date(${analyticsEvents.createdAt})`,
      total: sql<number>`count(*)`,
      success: sql<number>`count(*) filter (where ${analyticsEvents.eventData}->>'status' = 'success')`,
      failed: sql<number>`count(*) filter (where ${analyticsEvents.eventData}->>'status' = 'failed')`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'deploy'),
      gte(analyticsEvents.createdAt, since)
    ))
    .groupBy(sql`date(${analyticsEvents.createdAt})`)
    .orderBy(sql`date(${analyticsEvents.createdAt})`)

  return rows.map((r) => ({
    date: r.date,
    total: Number(r.total),
    success: Number(r.success),
    failed: Number(r.failed),
  }))
}

export async function getCostAnalysis(workspaceId: string) {
  const [tokensUsed] = await db
    .select({
      inputTokens: sql<number>`coalesce(sum((${analyticsEvents.eventData}->>'input_tokens')::int), 0)`,
      outputTokens: sql<number>`coalesce(sum((${analyticsEvents.eventData}->>'output_tokens')::int), 0)`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.workspaceId, workspaceId),
      eq(analyticsEvents.eventType, 'token_usage')
    ))

  const inputCost = Number(tokensUsed.inputTokens) * 0.000003
  const outputCost = Number(tokensUsed.outputTokens) * 0.000015

  return {
    tokens: {
      input: Number(tokensUsed.inputTokens),
      output: Number(tokensUsed.outputTokens),
      total: Number(tokensUsed.inputTokens) + Number(tokensUsed.outputTokens),
    },
    cost: {
      input: Math.round(inputCost * 100) / 100,
      output: Math.round(outputCost * 100) / 100,
      total: Math.round((inputCost + outputCost) * 100) / 100,
    },
  }
}
