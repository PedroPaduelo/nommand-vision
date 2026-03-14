import { db } from '../db/index.js'
import { agents, agentRuns, projects, users } from '../db/schema/index.js'
import { eq, and, desc, sql, or, like } from 'drizzle-orm'
import type { CreateAgentInput, UpdateAgentInput, ListAgentsInput } from '../schemas/agents.schema.js'

export async function list(workspaceId: string, filters: ListAgentsInput) {
  const conditions: ReturnType<typeof eq | typeof like>[] = [eq(agents.workspaceId, workspaceId)]

  if (filters.status) {
    conditions.push(eq(agents.status, filters.status))
  }
  if (filters.category) {
    conditions.push(eq(agents.category, filters.category))
  }
  if (filters.search) {
    const searchPattern = `%${filters.search}%`
    conditions.push(
      or(
        like(agents.name, searchPattern),
        sql`COALESCE(${agents.description}, '') LIKE ${searchPattern}`
      )!
    )
  }

  const offset = (filters.page - 1) * filters.limit

  const list = await db
    .select()
    .from(agents)
    .where(and(...conditions))
    .orderBy(desc(agents.updatedAt))
    .limit(filters.limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(agents)
    .where(and(...conditions))

  return {
    data: list.map(formatAgent),
    meta: {
      total: Number(count),
      page: filters.page,
      perPage: filters.limit,
    },
  }
}

export async function get(id: string) {
  const agent = await getRaw(id)
  return formatAgent(agent)
}

async function getRaw(id: string) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .limit(1)

  if (!agent) {
    throw new Error('Agent not found')
  }

  return agent
}

export async function create(workspaceId: string, userId: string, input: CreateAgentInput) {
  const [agent] = await db
    .insert(agents)
    .values({
      workspaceId,
      name: input.name,
      description: input.description,
      type: input.type || 'custom',
      model: input.model || 'claude-sonnet-4-20250514',
      systemPrompt: input.systemPrompt,
      temperature: input.temperature?.toString() || '0.7',
      maxTokens: input.maxTokens || 4096,
      tools: input.tools || [],
      iconColor: input.iconColor,
      isActive: input.isActive !== false ? '1' : '0',
      category: input.category || 'custom',
      createdBy: userId,
    })
    .returning()

  return formatAgent(agent)
}

export async function update(id: string, input: UpdateAgentInput) {
  const values: Record<string, unknown> = {
    ...input,
    updatedAt: new Date(),
  }

  if (input.temperature !== undefined) {
    values.temperature = input.temperature.toString()
  }

  if (input.isActive !== undefined) {
    values.isActive = input.isActive ? '1' : '0'
  }

  const [agent] = await db
    .update(agents)
    .set(values)
    .where(eq(agents.id, id))
    .returning()

  if (!agent) {
    throw new Error('Agent not found')
  }

  return formatAgent(agent)
}

export async function remove(id: string) {
  const [agent] = await db
    .delete(agents)
    .where(eq(agents.id, id))
    .returning()

  if (!agent) {
    throw new Error('Agent not found')
  }

  return { success: true }
}

export async function toggle(id: string) {
  const existing = await getRaw(id)
  const newStatus = existing.isActive === '1' ? '0' : '1'

  const [agent] = await db
    .update(agents)
    .set({ isActive: newStatus, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning()

  return formatAgent(agent)
}

export async function run(id: string, input: { input: string; projectId?: string; userId?: string }) {
  const agent = await get(id)

  if (!agent.isActive) {
    throw new Error('Agent is not active')
  }

  const startTime = Date.now()

  const [run] = await db
    .insert(agentRuns)
    .values({
      agentId: id,
      projectId: input.projectId,
      userId: input.userId,
      input: input.input,
      status: 'running',
    })
    .returning()

  try {
    let output = ''
    const tokensUsed = Math.floor(Math.random() * 500) + 100

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const simulationResponses = [
      `Analysis based on "${input.input.substring(0, 50)}...":`,
      'Recommendation: Consider refactoring the code for better maintainability.',
      'Security note: Validate all user inputs before processing.',
      'Performance: Use indexing for frequent queries.',
    ]

    output = simulationResponses.join('\n\n')

    const durationMs = Date.now() - startTime

    await db
      .update(agentRuns)
      .set({
        output,
        tokensUsed,
        durationMs,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(agentRuns.id, run.id))

    await updateStats(id, { duration: durationMs, success: true })

    return {
      id: run.id,
      agentId: id,
      input: input.input,
      output,
      tokensUsed,
      durationMs,
      status: 'completed',
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime

    await db
      .update(agentRuns)
      .set({
        status: 'error',
        error: error.message || 'Unknown error',
        completedAt: new Date(),
      })
      .where(eq(agentRuns.id, run.id))

    await updateStats(id, { duration: durationMs, success: false })

    throw error
  }
}

export async function getStats(id: string) {
  const agent = await get(id)

  return {
    totalRuns: agent.statsTotalRuns || 0,
    avgDurationMs: agent.statsAvgDurationMs || 0,
    successRate: Number(agent.statsSuccessRate || 100),
    category: agent.category,
    model: agent.model,
  }
}

async function updateStats(id: string, stats: { duration: number; success: boolean }) {
  const agent = await getRaw(id)

  const totalRuns = (Number(agent.statsTotalRuns) || 0) + 1
  const currentAvg = Number(agent.statsAvgDurationMs) || 0
  const newAvg = Math.round((currentAvg * (totalRuns - 1) + stats.duration) / totalRuns)

  const currentSuccessRate = Number(agent.statsSuccessRate) || 100
  const successCount = Math.round((currentSuccessRate * (totalRuns - 1)) / 100) + (stats.success ? 1 : 0)
  const newSuccessRate = (successCount / totalRuns) * 100

  await db
    .update(agents)
    .set({
      statsTotalRuns: totalRuns,
      statsAvgDurationMs: newAvg,
      statsSuccessRate: newSuccessRate.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id))
}

export async function listRuns(agentId: string, filters: { page?: number; limit?: number }) {
  const page = filters.page || 1
  const limit = filters.limit || 20
  const offset = (page - 1) * limit

  const conditions = [eq(agentRuns.agentId, agentId)]

  const list = await db
    .select()
    .from(agentRuns)
    .where(and(...conditions))
    .orderBy(desc(agentRuns.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(agentRuns)
    .where(and(...conditions))

  return {
    data: list.map(formatRun),
    meta: {
      total: Number(count),
      page,
      perPage: limit,
    },
  }
}

export async function getRun(runId: string) {
  const [run] = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.id, runId))
    .limit(1)

  if (!run) {
    throw new Error('Run not found')
  }

  return formatRun(run)
}

export async function listByProject(workspaceId: string, projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, projectId)))
    .limit(1)

  if (!project) {
    throw new Error('Project not found')
  }

  const agentIds = (project.agentIds as string[]) || []
  if (agentIds.length === 0) {
    return { data: [] }
  }

  const list = await db
    .select()
    .from(agents)
    .where(and(eq(agents.workspaceId, workspaceId), sql`${agents.id} = ANY(${agentIds})`))

  return { data: list.map(formatAgent) }
}

function formatAgent(agent: typeof agents.$inferSelect) {
  return {
    id: agent.id,
    workspaceId: agent.workspaceId,
    name: agent.name,
    description: agent.description,
    type: agent.type,
    model: agent.model,
    systemPrompt: agent.systemPrompt,
    config: agent.config,
    temperature: agent.temperature ? Number(agent.temperature) : 0.7,
    maxTokens: agent.maxTokens,
    tools: agent.tools,
    iconColor: agent.iconColor,
    isActive: agent.isActive === '1',
    status: agent.status,
    category: agent.category,
    statsTotalRuns: agent.statsTotalRuns,
    statsAvgDurationMs: agent.statsAvgDurationMs,
    statsSuccessRate: agent.statsSuccessRate ? Number(agent.statsSuccessRate) : 100,
    createdBy: agent.createdBy,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  }
}

function formatRun(run: typeof agentRuns.$inferSelect) {
  return {
    id: run.id,
    agentId: run.agentId,
    projectId: run.projectId,
    userId: run.userId,
    input: run.input,
    output: run.output,
    tokensUsed: run.tokensUsed,
    durationMs: run.durationMs,
    status: run.status,
    error: run.error,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    createdAt: run.createdAt,
  }
}
