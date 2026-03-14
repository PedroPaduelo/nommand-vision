import { api } from './api'
import type { InboxMessage } from '@/types/index.ts'

type InboxListResponse = {
  data: InboxMessage[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

export async function getMessages(filter?: string): Promise<InboxMessage[]> {
  const params = new URLSearchParams()
  if (filter && filter !== 'all') params.set('filter', filter)

  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await api.get<InboxListResponse>(`/inbox${query}`)
  return result.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMessage(id: any): Promise<InboxMessage> {
  const result = await api.get<{ data: InboxMessage }>(`/inbox/${String(id)}`)
  return result.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function markRead(id: any): Promise<InboxMessage> {
  const result = await api.post<{ data: InboxMessage }>(`/inbox/${String(id)}/read`, {})
  return result.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function markUnread(id: any): Promise<InboxMessage> {
  const msg = await getMessage(id)
  return msg
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function archiveMessage(id: any): Promise<boolean> {
  const result = await api.post<{ data: boolean }>(`/inbox/${String(id)}/archive`, {})
  return result.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function unarchiveMessage(id: any): Promise<InboxMessage> {
  const result = await api.post<{ data: InboxMessage }>(`/inbox/${String(id)}/unarchive`, {})
  return result.data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteMessage(id: any): Promise<boolean> {
  await api.delete(`/inbox/${String(id)}`)
  return true
}

export async function markAllRead(): Promise<void> {
  await api.post('/inbox/read-all', {})
}

export async function getUnreadCount(): Promise<number> {
  const result = await api.get<{ data: number }>('/inbox/unread-count')
  return result.data
}
