import { api } from './api'
import type { Workflow } from '@/types/index.ts'

type AutomationListResponse = {
  data: Workflow[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

type WorkflowResponse = {
  data: Workflow
}

type AutomationRunResponse = {
  data: {
    id: string
    status: string
    startedAt: string
    completedAt?: string
    output?: Record<string, unknown>
  }
}

type AutomationRunsResponse = {
  data: Array<{
    id: string
    status: string
    startedAt: string
    completedAt?: string
  }>
  meta: {
    total: number
    page: number
    perPage: number
  }
}

export async function getWorkflows(filters?: { enabled?: boolean; page?: number; perPage?: number }): Promise<Workflow[]> {
  const params = new URLSearchParams()
  if (filters?.enabled !== undefined) params.set('enabled', String(filters.enabled))
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.perPage) params.set('perPage', String(filters.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<AutomationListResponse>(`/automations${query}`)
  return result.data
}

export async function getWorkflowById(id: string): Promise<Workflow> {
  const result = await api.get<WorkflowResponse>(`/automations/${id}`)
  return result.data
}

export async function createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
  const result = await api.post<WorkflowResponse>('/automations', {
    name: data.name,
    description: data.desc,
    triggerType: 'manual',
    actions: data.steps || [],
    enabled: true,
  })
  return result.data
}

export async function updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
  const result = await api.put<WorkflowResponse>(`/automations/${id}`, {
    name: data.name,
    description: data.desc,
    actions: data.steps,
    enabled: data.active,
  })
  return result.data
}

export async function toggleWorkflow(id: string): Promise<Workflow> {
  const result = await api.patch<WorkflowResponse>(`/automations/${id}/toggle`, {})
  return result.data
}

export async function deleteWorkflow(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ data: { success: boolean } }>(`/automations/${id}`)
  return result.data
}

export async function triggerWorkflow(id: string): Promise<{ runId: string; status: string }> {
  const result = await api.post<{ data: { runId: string; status: string } }>(`/automations/${id}/trigger`, {})
  return result.data
}

export async function executeWorkflow(id: string): Promise<{ runId: string; status: string }> {
  const result = await api.post<{ data: { runId: string; status: string } }>(`/automations/${id}/execute`, {})
  return result.data
}

export async function getWorkflowHistory(id: string, page = 1, perPage = 20): Promise<{ data: any[]; meta: { total: number; page: number; perPage: number } }> {
  return api.get(`/automations/${id}/history?page=${page}&perPage=${perPage}`)
}

export async function getWorkflowRuns(id: string, page = 1, perPage = 20): Promise<{ data: any[]; meta: { total: number; page: number; perPage: number } }> {
  return api.get(`/automations/${id}/runs?page=${page}&perPage=${perPage}`)
}

export async function getAutomationRun(runId: string): Promise<{ id: string; status: string; startedAt: string; completedAt?: string; output?: Record<string, unknown> }> {
  const result = await api.get<AutomationRunResponse>(`/automations/runs/${runId}`)
  return result.data
}

export async function cancelAutomationRun(runId: string): Promise<{ success: boolean }> {
  const result = await api.post<{ data: { success: boolean } }>(`/automations/runs/${runId}/cancel`, {})
  return result.data
}
