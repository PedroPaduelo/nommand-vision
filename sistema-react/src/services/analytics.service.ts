import { api } from './api'
import type { Endpoint } from '@/types/index.ts'

interface GeoData {
  name: string
  value: number
  flag: string
}

interface PeriodData {
  labels: string[]
  requests: number[]
  latency: number[]
  errors: number[]
}

interface DashboardData {
  period: string
  deploys: {
    total: number
    success: number
    failed: number
    success_rate: number
  }
  agents: {
    active: number
  }
  messages: {
    total: number
  }
  performance: {
    avg_response_time_ms: number
  }
  geo?: GeoData[]
  top_endpoints?: Array<{
    endpoint: string
    requests: number
    latency: number
    error: number
    p99: number
    status: string
  }>
}

export async function getMetrics(period: string): Promise<DashboardData> {
  const result = await api.get<{ data: DashboardData }>(`/analytics/dashboard?period=${period}`)
  return result.data
}

export async function getEndpoints(): Promise<Endpoint[]> {
  const result = await api.get<{ data: Endpoint[] }>('/analytics/top-projects')
  return result.data
}

export async function getGeoData(period: string = '7d'): Promise<GeoData[]> {
  const result = await api.get<{ data: DashboardData }>(`/analytics/dashboard?period=${period}`)
  return result.data.geo || [
    { name: 'Brasil', value: 35, flag: '🇧🇷' },
    { name: 'EUA', value: 25, flag: '🇺🇸' },
    { name: 'Europa', value: 20, flag: '🇪🇺' },
    { name: 'Ásia', value: 15, flag: '🌏' },
    { name: 'Outros', value: 5, flag: '🌍' },
  ]
}

export async function getPeriodData(period: string): Promise<PeriodData> {
  const result = await api.get<{ data: PeriodData }>(`/analytics/timeseries?period=${period}&metric=requests`)
  return result.data
}

export async function getTopProjects(): Promise<{ name: string; deploys: number; commits: number }[]> {
  const result = await api.get<{ data: { name: string; deploys: number; commits: number }[] }>('/analytics/top-projects')
  return result.data
}

export async function getTopAgents(): Promise<{ name: string; runs: number }[]> {
  const result = await api.get<{ data: { name: string; runs: number }[] }>('/analytics/top-agents')
  return result.data
}

export async function getTokenUsage(): Promise<{ total: number; period: string }> {
  const result = await api.get<{ data: { total: number; period: string } }>('/analytics/tokens')
  return result.data
}

export async function trackEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
  await api.post('/analytics/track', { event, properties })
}

// Tipos para alertas
export interface Alert {
  id: string
  type: 'error_rate' | 'latency' | 'deploy_failure' | 'uptime'
  threshold: number
  currentValue: number
  status: 'ok' | 'warning' | 'critical'
  message: string
  triggeredAt?: string
}

export interface AlertConfig {
  type: Alert['type']
  enabled: boolean
  threshold: number
  email?: string
  webhook?: string
}

// Função para verificar alertas baseados em dados do dashboard
export function checkAlerts(dashboard: DashboardData, configs: AlertConfig[]): Alert[] {
  const alerts: Alert[] = []
  const now = new Date().toISOString()

  for (const config of configs) {
    if (!config.enabled) continue

    switch (config.type) {
      case 'error_rate': {
        const errorRate = dashboard.deploys.total > 0
          ? (dashboard.deploys.failed / dashboard.deploys.total) * 100
          : 0
        alerts.push({
          id: `alert-error-rate-${Date.now()}`,
          type: 'error_rate',
          threshold: config.threshold,
          currentValue: Math.round(errorRate * 100) / 100,
          status: errorRate > config.threshold ? 'critical' : errorRate > config.threshold * 0.7 ? 'warning' : 'ok',
          message: `Taxa de erro: ${errorRate.toFixed(2)}% (threshold: ${config.threshold}%)`,
          triggeredAt: errorRate > config.threshold ? now : undefined,
        })
        break
      }
      case 'latency': {
        const latency = dashboard.performance.avg_response_time_ms
        alerts.push({
          id: `alert-latency-${Date.now()}`,
          type: 'latency',
          threshold: config.threshold,
          currentValue: latency,
          status: latency > config.threshold ? 'critical' : latency > config.threshold * 0.7 ? 'warning' : 'ok',
          message: `Latência média: ${latency}ms (threshold: ${config.threshold}ms)`,
          triggeredAt: latency > config.threshold ? now : undefined,
        })
        break
      }
      case 'deploy_failure': {
        const failureRate = dashboard.deploys.total > 0
          ? (dashboard.deploys.failed / dashboard.deploys.total) * 100
          : 0
        alerts.push({
          id: `alert-deploy-failure-${Date.now()}`,
          type: 'deploy_failure',
          threshold: config.threshold,
          currentValue: Math.round(failureRate * 100) / 100,
          status: failureRate > config.threshold ? 'critical' : failureRate > config.threshold * 0.7 ? 'warning' : 'ok',
          message: `Falhas em deploys: ${failureRate.toFixed(2)}% (threshold: ${config.threshold}%)`,
          triggeredAt: failureRate > config.threshold ? now : undefined,
        })
        break
      }
      case 'uptime': {
        const uptime = 99.9 // Exemplo: uptime hardcoded ou calculado
        alerts.push({
          id: `alert-uptime-${Date.now()}`,
          type: 'uptime',
          threshold: config.threshold,
          currentValue: uptime,
          status: uptime < config.threshold ? 'critical' : uptime < config.threshold + 0.05 ? 'warning' : 'ok',
          message: `Uptime: ${uptime}% (threshold: ${config.threshold}%)`,
          triggeredAt: uptime < config.threshold ? now : undefined,
        })
        break
      }
    }
  }

  return alerts
}

// Função para exportar dados para CSV
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Função para exportar dados para JSON
export function exportToJSON(data: Record<string, unknown>, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
  link.click()
}
