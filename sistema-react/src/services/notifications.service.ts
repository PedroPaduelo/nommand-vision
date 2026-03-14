import { api } from './api'
import type { Notification } from '@/types/index.ts'

type NotificationListResponse = {
  data: Notification[]
  meta: {
    total: number
    unread: number
  }
}

export async function getNotifications(filters?: { unread?: boolean; page?: number; perPage?: number }): Promise<Notification[]> {
  const params = new URLSearchParams()
  if (filters?.unread !== undefined) params.set('unread', String(filters.unread))
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.perPage) params.set('perPage', String(filters.perPage))

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<NotificationListResponse>(`/notifications${query}`)
  return result.data
}

export async function markRead(id: string): Promise<Notification> {
  const result = await api.patch<{ data: Notification }>(`/notifications/${id}/read`, {})
  return result.data
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/read-all', {})
}

export async function clearAll(): Promise<void> {
  await markAllRead()
}

export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  const result = await api.delete<{ data: { success: boolean } }>(`/notifications/${id}`)
  return result.data
}

export async function getUnreadCount(): Promise<number> {
  const result = await api.get<{ data: number }>('/notifications/unread-count')
  return result.data
}

export async function getPreferences(): Promise<{ deploy: boolean; deployFail: boolean; mention: boolean; ai: boolean; perf: boolean; email: boolean }> {
  const result = await api.get<{ data: { deploy: boolean; deployFail: boolean; mention: boolean; ai: boolean; perf: boolean; email: boolean } }>('/notifications/preferences')
  return result.data
}

export async function updatePreferences(prefs: Partial<{ deploy: boolean; deployFail: boolean; mention: boolean; ai: boolean; perf: boolean; email: boolean }>): Promise<{ deploy: boolean; deployFail: boolean; mention: boolean; ai: boolean; perf: boolean; email: boolean }> {
  const result = await api.put<{ data: { deploy: boolean; deployFail: boolean; mention: boolean; ai: boolean; perf: boolean; email: boolean } }>('/notifications/preferences', prefs)
  return result.data
}
