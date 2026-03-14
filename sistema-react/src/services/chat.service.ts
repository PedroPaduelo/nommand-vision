import { api } from './api'

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokensIn?: number
  tokensOut?: number
  durationMs?: number
  createdAt: string
}

export interface ChatSession {
  id: string
  workspaceId: string
  projectId?: string
  userId: string
  title: string
  model: string
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export interface SendMessageRequest {
  content: string
  model?: string
}

export async function listChatSessions(filters?: { projectId?: string }) {
  const params = new URLSearchParams()
  if (filters?.projectId) params.set('projectId', filters.projectId)
  const query = params.toString() ? `?${params}` : ''
  return api.get<{ data: ChatSession[] }>(`/chat/sessions${query}`)
}

export async function getChatSession(id: string) {
  return api.get<{ data: ChatSession }>(`/chat/sessions/${id}`)
}

export async function createChatSession(data: { projectId?: string; title?: string; model?: string }) {
  return api.post<{ data: ChatSession }>('/chat/sessions', data)
}

export async function deleteChatSession(id: string) {
  return api.delete<{ data: { success: boolean } }>(`/chat/sessions/${id}`)
}

export async function sendMessage(sessionId: string, data: SendMessageRequest) {
  return api.post<{ data: ChatMessage }>(`/chat/sessions/${sessionId}/messages`, data)
}

export async function streamMessage(
  sessionId: string,
  data: SendMessageRequest,
  onChunk: (chunk: string) => void,
  onComplete: (message: ChatMessage) => void,
  onError: (error: Error) => void
) {
  const token = localStorage.getItem('nommand_access_token')
  const apiUrl = import.meta.env.VITE_API_URL || '/api'

  try {
    const response = await fetch(`${apiUrl}/chat/sessions/${sessionId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          if (data === '[DONE]') {
            continue
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'chunk') {
              onChunk(parsed.content)
            } else if (parsed.type === 'complete') {
              onComplete(parsed.message)
            } else if (parsed.type === 'error') {
              onError(new Error(parsed.error))
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error as Error)
  }
}
