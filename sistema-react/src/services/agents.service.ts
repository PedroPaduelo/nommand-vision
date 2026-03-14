import { api } from './api'
import type { Agent } from '@/types/index.ts'

type AgentListResponse = {
  data: Agent[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

type AgentResponse = {
  data: Agent
}

export async function getAgents(filters?: { status?: string; page?: number; perPage?: number }): Promise<Agent[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.perPage) params.set('perPage', String(filters.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<AgentListResponse>(`/agents${query}`)
  return result.data
}

export async function getAgentById(id: string): Promise<Agent> {
  const result = await api.get<AgentResponse>(`/agents/${id}`)
  return result.data
}

export async function createAgent(data: Partial<Agent>): Promise<Agent> {
  const result = await api.post<AgentResponse>('/agents', data)
  return result.data
}

export async function updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
  const result = await api.patch<AgentResponse>(`/agents/${id}`, data)
  return result.data
}

export async function toggleAgent(id: string): Promise<Agent> {
  const result = await api.post<AgentResponse>(`/agents/${id}/toggle`, {})
  return result.data
}

export async function startAgent(id: string): Promise<Agent> {
  const result = await api.post<AgentResponse>(`/agents/${id}/start`, {})
  return result.data
}

export async function stopAgent(id: string): Promise<Agent> {
  const result = await api.post<AgentResponse>(`/agents/${id}/stop`, {})
  return result.data
}

export async function deleteAgent(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ success: boolean }>(`/agents/${id}`)
  return result
}

export async function getAgentStats(id: string): Promise<{ tasks: number; tokens: string; uptime: string; avgLatency: string }> {
  const result = await api.get<{ data: { tasks: number; tokens: string; uptime: string; avgLatency: string } }>(`/agents/${id}/stats`)
  return result.data
}

export async function runAgent(id: string, input?: { input: string; userId?: string }): Promise<{ runId: string; status: string }> {
  const result = await api.post<{ data: { runId: string; status: string } }>(`/agents/${id}/run`, input || {})
  return result.data
}

export async function getAgentRuns(id: string, page = 1, limit = 20): Promise<{ data: any[]; meta: { total: number; page: number; perPage: number } }> {
  return api.get(`/agents/${id}/runs?page=${page}&limit=${limit}`)
}
