import type { WebSocket } from 'ws'
import { db } from '../db/index.js'
import { users } from '../db/schema/index.js'
import { eq, inArray } from 'drizzle-orm'

interface WsConnection {
  ws: WebSocket
  userId: string
  workspaceId: string
}

class WebSocketManager {
  private connections = new Map<string, WsConnection[]>()

  addConnection(userId: string, workspaceId: string, ws: WebSocket) {
    const existing = this.connections.get(userId) || []
    existing.push({ ws, userId, workspaceId })
    this.connections.set(userId, existing)
  }

  removeConnection(userId: string, ws: WebSocket) {
    const existing = this.connections.get(userId)
    if (!existing) return
    const filtered = existing.filter((c) => c.ws !== ws)
    if (filtered.length === 0) {
      this.connections.delete(userId)
    } else {
      this.connections.set(userId, filtered)
    }
  }

  sendToUser(userId: string, event: string, data: unknown) {
    const conns = this.connections.get(userId)
    if (!conns) return
    const message = JSON.stringify({ event, data })
    for (const conn of conns) {
      if (conn.ws.readyState === 1) {
        conn.ws.send(message)
      }
    }
  }

  sendToWorkspace(workspaceId: string, event: string, data: unknown) {
    const message = JSON.stringify({ event, data })
    for (const conns of this.connections.values()) {
      for (const conn of conns) {
        if (conn.workspaceId === workspaceId && conn.ws.readyState === 1) {
          conn.ws.send(message)
        }
      }
    }
  }

  broadcast(event: string, data: unknown) {
    const message = JSON.stringify({ event, data })
    for (const conns of this.connections.values()) {
      for (const conn of conns) {
        if (conn.ws.readyState === 1) {
          conn.ws.send(message)
        }
      }
    }
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connections.keys())
  }

  getOnlineCount(): number {
    return this.connections.size
  }
}

export const wsManager = new WebSocketManager()
