import { api } from './api'
import type { Project } from '@/types/index.ts'

type ProjectListResponse = {
  data: Project[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

type ProjectResponse = {
  data: Project
}

type StatsResponse = {
  data: {
    commits: number
    deploys: number
    uptime: string
    lastDeploy: string
  }
}

type ActivityResponse = {
  data: Array<{
    color: string
    text: string
    time: string
    tag?: string
    tagColor?: string
    tagTextColor?: string
  }>
}

export async function getProjects(filters?: { status?: string; role?: string; page?: number; perPage?: number }): Promise<Project[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.role) params.set('role', filters.role)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.perPage) params.set('perPage', String(filters.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<ProjectListResponse>(`/projects${query}`)

  return result.data
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const result = await api.get<ProjectResponse>(`/projects/${slug}`)
    return result.data
  } catch {
    return undefined
  }
}

export async function getProjectById(id: string): Promise<Project> {
  const result = await api.get<ProjectResponse>(`/projects/${id}`)
  return result.data
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const result = await api.post<ProjectResponse>('/projects', data)
  return result.data
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const result = await api.put<ProjectResponse>(`/projects/${id}`, data)
  return result.data
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ success: boolean }>(`/projects/${id}`)
  return result
}

export async function getProjectStats(id: string): Promise<{ commits: number; deploys: number; uptime: string; lastDeploy: string }> {
  const result = await api.get<StatsResponse>(`/projects/${id}/stats`)
  return result.data
}

export async function getProjectActivity(id: string): Promise<Array<{ color: string; text: string; time: string; tag?: string; tagColor?: string; tagTextColor?: string }>> {
  const result = await api.get<ActivityResponse>(`/projects/${id}/activity`)
  return result.data
}
