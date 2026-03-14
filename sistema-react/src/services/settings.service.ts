import { api } from './api'

interface Settings {
  workspaceName: string
  region: string
  domain: string
  devMode: boolean
  autoSave: boolean
  telemetry: boolean
  theme: 'dark' | 'light'
  accentColor: string
  compactSidebar: boolean
  animations: boolean
  font: string
  fontSize: string
  notifDeploy: boolean
  notifDeployFail: boolean
  notifMention: boolean
  notifAi: boolean
  notifPerf: boolean
  notifEmail: boolean
}

interface Integration {
  key: string
  icon: string
  name: string
  desc: string
  connected: boolean
}

interface ApiKey {
  id: string
  name: string
  key: string
  status: 'active' | 'test' | 'revoked'
  createdAt: string
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  active: boolean
}

interface BillingData {
  plan: string
  price: number
  features: string[]
  nextPayment: string
  paymentMethod: string
  usage: Array<{ label: string; used: number; total: number; unit: string }>
}

export async function getSettings(): Promise<Settings> {
  const result = await api.get<{ data: Settings }>('/settings')
  return result.data
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const result = await api.patch<{ data: Settings }>('/settings', data)
  return result.data
}

export async function updateSetting(key: string, value: unknown): Promise<{ key: string; value: unknown }> {
  const result = await api.patch<{ data: { key: string; value: unknown } }>(`/settings/${key}`, value)
  return result.data
}

export async function getIntegrations(): Promise<Integration[]> {
  const result = await api.get<{ data: Integration[] }>('/settings/integrations')
  return result.data
}

export async function toggleIntegration(id: string): Promise<Integration[]> {
  const result = await api.post<{ data: Integration[] }>(`/settings/integrations/${id}/toggle`, {})
  return result.data
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const result = await api.get<{ data: ApiKey[] }>('/settings/api-keys')
  return result.data
}

export async function createApiKey(name: string): Promise<ApiKey> {
  const result = await api.post<{ data: ApiKey }>('/settings/api-keys', { name })
  return result.data
}

export async function generateApiKey(name: string): Promise<ApiKey> {
  return createApiKey(name)
}

export async function revokeApiKey(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ data: { success: boolean } }>(`/settings/api-keys/${id}`)
  return result.data
}

export async function getWebhooks(): Promise<Webhook[]> {
  const result = await api.get<{ data: Webhook[] }>('/settings/webhooks')
  return result.data
}

export async function createWebhook(data: { name: string; url: string; events: string[] }): Promise<Webhook> {
  const result = await api.post<{ data: Webhook }>('/settings/webhooks', data)
  return result.data
}

export async function updateWebhook(id: string, data: Partial<{ name: string; url: string; events: string[]; active: boolean }>): Promise<Webhook> {
  const result = await api.patch<{ data: Webhook }>(`/settings/webhooks/${id}`, data)
  return result.data
}

export async function deleteWebhook(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ data: { success: boolean } }>(`/settings/webhooks/${id}`)
  return result.data
}

export async function testWebhook(id: string): Promise<{ success: boolean; message: string }> {
  const result = await api.post<{ data: { success: boolean; message: string } }>(`/settings/webhooks/${id}/test`, {})
  return result.data
}

export async function getBilling(): Promise<BillingData> {
  const result = await api.get<{ data: BillingData }>('/settings/billing')
  return result.data
}
