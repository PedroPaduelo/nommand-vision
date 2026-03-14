import { api } from './api'
import type { LogEntry } from '@/types/index.ts'

interface LogAlert {
  id: string
  sev: 'critical' | 'warning' | 'info' | 'resolved'
  title: string
  desc: string
  meta: string
  time: string
  acked?: boolean
}

type LogListResponse = {
  data: LogEntry[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

export async function getLogs(filter?: { level?: string; search?: string; page?: number; perPage?: number }): Promise<LogEntry[]> {
  const params = new URLSearchParams()
  if (filter?.level && filter.level !== 'ALL') params.set('level', filter.level)
  if (filter?.search) params.set('search', filter.search)
  if (filter?.page) params.set('page', String(filter.page))
  if (filter?.perPage) params.set('perPage', String(filter.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<LogListResponse>(`/logs${query}`)
  return result.data
}

export async function getLogById(id: string): Promise<LogEntry> {
  const result = await api.get<{ data: LogEntry }>(`/logs/${id}`)
  return result.data
}

export async function searchLogs(query: string, limit = 50): Promise<LogEntry[]> {
  const result = await api.get<LogListResponse>(`/logs/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  return result.data
}

export async function getLogStats(): Promise<{ total: number; byLevel: Record<string, number> }> {
  const result = await api.get<{ data: { total: number; byLevel: Record<string, number> } }>('/logs/stats')
  return result.data
}

export async function cleanupLogs(olderThanDays: number): Promise<{ deleted: number }> {
  const result = await api.delete<{ data: { deleted: number } }>(`/logs/cleanup?olderThanDays=${olderThanDays}`)
  return result.data
}

export async function getAlerts(): Promise<LogAlert[]> {
  const result = await api.get<{ data: LogAlert[] }>('/logs/alerts')
  return result.data
}

export function generateLogEntry(): LogEntry {
  const levels: Array<'INFO' | 'WARN' | 'ERROR' | 'DEBUG'> = ['INFO', 'WARN', 'ERROR', 'DEBUG']
  const sources = ['API', 'Auth', 'Database', 'Worker', 'Scheduler', 'Gateway']
  const messages = [
    'Request processed successfully',
    'Cache miss for key',
    'Connection timeout',
    'User authentication failed',
    'Database query slow',
    'Payment processed',
    'Email notification sent',
    'Backup completed',
    'Rate limit exceeded',
    'Invalid token provided'
  ]

  const level = levels[Math.floor(Math.random() * levels.length)]
  const source = sources[Math.floor(Math.random() * sources.length)]
  const message = messages[Math.floor(Math.random() * messages.length)]

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    detail: level === 'ERROR' ? `Stack trace at ${source}Service.ts:${Math.floor(Math.random() * 1000)}` : undefined
  }
}
