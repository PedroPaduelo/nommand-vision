import { db } from '../db/index.js'
import { projects } from '../db/schema/index.js'
import { eq, and, desc, isNull, sql } from 'drizzle-orm'
import { generateUniqueSlug } from '../lib/slug.js'
import type { CreateProjectInput, UpdateProjectInput, ListProjectsInput } from '../schemas/projects.schema.js'

export async function listProjects(workspaceId: string, input: ListProjectsInput) {
  const conditions = [eq(projects.workspaceId, workspaceId), isNull(projects.deletedAt)]

  if (input.status) {
    conditions.push(eq(projects.status, input.status))
  }
  if (input.role) {
    conditions.push(eq(projects.role, input.role))
  }

  const offset = (input.page - 1) * input.perPage

  const list = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.updatedAt))
    .limit(input.perPage)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(and(...conditions))

  return {
    data: list.map(formatProject),
    meta: {
      total: Number(count),
      page: input.page,
      perPage: input.perPage,
    },
  }
}

export async function getProjectBySlug(workspaceId: string, slug: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.slug, slug), isNull(projects.deletedAt)))
    .limit(1)

  if (!project) {
    throw new Error('Project not found')
  }

  return formatProject(project)
}

export async function getProjectById(workspaceId: string, id: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id), isNull(projects.deletedAt)))
    .limit(1)

  if (!project) {
    throw new Error('Project not found')
  }

  return formatProject(project)
}

export async function createProject(workspaceId: string, userId: string, input: CreateProjectInput) {
  const slug = await generateUniqueSlug(input.name, workspaceId)

  const [project] = await db
    .insert(projects)
    .values({
      workspaceId,
      name: input.name,
      slug,
      description: input.description,
      icon: input.icon,
      iconColor: input.iconColor,
      status: input.status || 'active',
      branch: input.branch || 'main',
      framework: input.framework,
      stack: input.stack,
      role: input.role,
      createdBy: userId,
    })
    .returning()

  return formatProject(project)
}

export async function updateProject(workspaceId: string, id: string, input: UpdateProjectInput) {
  const [project] = await db
    .update(projects)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id), isNull(projects.deletedAt)))
    .returning()

  if (!project) {
    throw new Error('Project not found')
  }

  return formatProject(project)
}

export async function deleteProject(workspaceId: string, id: string) {
  const [project] = await db
    .update(projects)
    .set({ deletedAt: new Date() })
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id), isNull(projects.deletedAt)))
    .returning()

  if (!project) {
    throw new Error('Project not found')
  }

  return { success: true }
}

export async function getProjectStats(workspaceId: string, projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1)

  if (!project) {
    throw new Error('Project not found')
  }

  return {
    commits: 0,
    deploys: 0,
    uptime: '100%',
    lastDeploy: project.updatedAt.toISOString(),
  }
}

export async function getProjectActivity(workspaceId: string, projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1)

  if (!project) {
    throw new Error('Project not found')
  }

  return {
    data: [
      {
        color: '#10b981',
        text: 'Projeto criado',
        time: project.createdAt.toISOString(),
      },
    ],
  }
}

function formatProject(project: typeof projects.$inferSelect) {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    desc: project.description,
    icon: project.icon,
    iconColor: project.iconColor,
    status: project.status,
    branch: project.branch,
    framework: project.framework,
    stack: project.stack,
    agentIds: project.agentIds,
    role: project.role,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}
