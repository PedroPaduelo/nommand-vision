import { api } from './api'
import type { Deploy } from '@/types/index.ts'

type DeployListResponse = {
  data: Deploy[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

type DeployResponse = {
  data: Deploy
}

export async function getDeploys(filter?: string): Promise<Deploy[]> {
  const params = new URLSearchParams()
  if (filter && filter !== 'all') params.set('env', filter)

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<DeployListResponse>(`/deploys${query}`)
  return result.data
}

export async function getDeployById(id: string): Promise<Deploy> {
  const result = await api.get<DeployResponse>(`/deploys/${id}`)
  return result.data
}

export async function createDeploy(data: { projectId: string; branch: string; env: string }): Promise<Deploy> {
  const result = await api.post<DeployResponse>('/deploys', data)
  return result.data
}

export async function cancelDeploy(id: string): Promise<Deploy> {
  const result = await api.post<DeployResponse>(`/deploys/${id}/cancel`, {})
  return result.data
}

export async function retryDeploy(id: string): Promise<Deploy> {
  const result = await api.post<DeployResponse>(`/deploys/${id}/retry`, {})
  return result.data
}

export async function rollbackDeploy(id: string): Promise<Deploy> {
  const result = await api.post<DeployResponse>(`/deploys/${id}/rollback`, {})
  return result.data
}

export async function getDeployLogs(id: string): Promise<{ data: string[] }> {
  return api.get(`/deploys/${id}/logs`)
}
