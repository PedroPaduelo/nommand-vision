import 'dotenv/config'
import { serve } from '@hono/node-server'
import { env } from './config/env.js'
import app from './app.js'
import { setupWebSocket } from './routes/ws.js'
import { logger } from './lib/logger.js'

const port = env.PORT

logger.info(`🚀 Server starting`, { port, env: env.NODE_ENV, version: '1.0.0' })

const server = serve({
  fetch: app.fetch,
  port,
})

setupWebSocket(server as any)

logger.info(`🚀 Server running`, { url: `http://0.0.0.0:${port}` })
