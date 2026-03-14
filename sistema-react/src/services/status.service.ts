import { api } from './api'
import type { StatusService, Incident } from '@/types/index.ts'

type StatusOverviewResponse = {
  data: {
    services: StatusService[]
    globalStatus: string
    overallUptime: string
  }
}

type UptimeHistoryResponse = {
  data: {
    history: Array<{ date: string; uptime: number }>
    percentage: number
  }
}

export async function getServices(): Promise<StatusService[]> {
  const result = await api.get<StatusOverviewResponse>('/status')
  return result.data.services
}

export async function getGlobalStatus(): Promise<{ status: string; uptime: string }> {
  const result = await api.get<StatusOverviewResponse>('/status')
  return { status: result.data.globalStatus, uptime: result.data.overallUptime }
}

export async function getServiceById(id: string): Promise<StatusService> {
  const result = await api.get<{ data: StatusService }>(`/status/services/${id}`)
  return result.data
}

export async function createService(data: { name: string; desc: string; icon?: string }): Promise<StatusService> {
  const result = await api.post<{ data: StatusService }>('/status/services', data)
  return result.data
}

export async function updateService(id: string, data: Partial<{ name: string; desc: string; status: string }>): Promise<StatusService> {
  const result = await api.patch<{ data: StatusService }>(`/status/services/${id}`, data)
  return result.data
}

export async function deleteService(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ data: { success: boolean } }>(`/status/services/${id}`)
  return result.data
}

export async function getUptimeHistory(id: string, days: number = 30): Promise<{ history: Array<{ date: string; uptime: number }>; percentage: number }> {
  const result = await api.get<UptimeHistoryResponse>(`/status/services/${id}/uptime?days=${days}`)
  return result.data
}

export async function getIncidents(filters?: { status?: string; severity?: string; page?: number; perPage?: number }): Promise<Incident[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.severity) params.set('severity', filters.severity)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.perPage) params.set('perPage', String(filters.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<{ data: Incident[] }>(`/status/incidents${query}`)
  return result.data
}

export async function createIncident(data: { title: string; severity: string; description: string }): Promise<Incident> {
  const result = await api.post<{ data: Incident }>('/status/incidents', data)
  return result.data
}

export async function updateIncident(id: string, data: Partial<{ title: string; severity: string; status: string }>): Promise<Incident> {
  const result = await api.patch<{ data: Incident }>(`/status/incidents/${id}`, data)
  return result.data
}

export async function resolveIncident(id: string): Promise<Incident> {
  const result = await api.post<{ data: Incident }>(`/status/incidents/${id}/resolve`, {})
  return result.data
}
