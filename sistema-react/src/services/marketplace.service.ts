import { api } from './api'
import type { MarketplaceAgent } from '@/types/index.ts'
import type { Role } from '@/types/index.ts'

type MarketplaceListResponse = {
  data: MarketplaceAgent[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

export async function getAgents(category?: string, search?: string): Promise<MarketplaceAgent[]> {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (search) params.set('search', search)

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<MarketplaceListResponse>(`/marketplace${query}`)
  return result.data
}

export async function getCategories(): Promise<string[]> {
  const result = await api.get<{ data: string[] }>('/marketplace/categories')
  return ['all', ...result.data]
}

export async function getAgentById(id: string): Promise<MarketplaceAgent> {
  const result = await api.get<{ data: MarketplaceAgent }>(`/marketplace/${id}`)
  return result.data
}

export async function installAgent(id: string, config?: Record<string, unknown>): Promise<{ installed: boolean }> {
  const result = await api.post<{ data: { installed: boolean } }>(`/marketplace/${id}/install`, config || {})
  return result.data
}

export async function uninstallAgent(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ data: { success: boolean } }>(`/marketplace/${id}/uninstall`)
  return result.data
}

export async function rateAgent(id: string, rating: number, review?: string): Promise<MarketplaceAgent> {
  const result = await api.post<{ data: MarketplaceAgent }>(`/marketplace/${id}/rate`, { rating, review })
  return result.data
}

export async function getInstalledAgents(): Promise<MarketplaceAgent[]> {
  const result = await api.get<{ data: MarketplaceAgent[] }>('/marketplace/installed')
  return result.data
}

export async function getRecommended(role: Role): Promise<MarketplaceAgent[]> {
  const result = await api.get<{ data: MarketplaceAgent[] }>(`/marketplace/recommended?role=${role}`)
  return result.data
}
