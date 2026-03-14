import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'
import { verifyAccessToken } from '../lib/jwt.js'
import { wsManager } from '../lib/ws-manager.js'

const HEARTBEAT_INTERVAL = 30_000

interface ExtWebSocket extends WebSocket {
  isAlive: boolean
  userId: string
  workspaceId: string
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`)

    if (url.pathname !== '/ws') {
      socket.destroy()
      return
    }

    const token = url.searchParams.get('token')
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    try {
      const payload = await verifyAccessToken(token)

      wss.handleUpgrade(request, socket, head, (ws) => {
        const extWs = ws as ExtWebSocket
        extWs.isAlive = true
        extWs.userId = payload.userId
        extWs.workspaceId = payload.workspaceId

        wss.emit('connection', extWs, request)
      })
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
    }
  })

  wss.on('connection', (ws: ExtWebSocket) => {
    wsManager.addConnection(ws.userId, ws.workspaceId, ws)

    ws.send(JSON.stringify({ event: 'connected', data: { userId: ws.userId } }))

    ws.on('pong', () => {
      ws.isAlive = true
    })

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.event === 'ping') {
          ws.send(JSON.stringify({ event: 'pong', data: { ts: Date.now() } }))
        }
      } catch {
        // ignore malformed messages
      }
    })

    ws.on('close', () => {
      wsManager.removeConnection(ws.userId, ws)
    })

    ws.on('error', () => {
      wsManager.removeConnection(ws.userId, ws)
    })
  })

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtWebSocket
      if (!extWs.isAlive) {
        wsManager.removeConnection(extWs.userId, extWs)
        return extWs.terminate()
      }
      extWs.isAlive = false
      extWs.ping()
    })
  }, HEARTBEAT_INTERVAL)

  wss.on('close', () => {
    clearInterval(heartbeat)
  })

  return wss
}
