import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorHandler } from './middleware/error-handler.js'
import { requestId } from './middleware/request-id.js'
import authRoutes from './routes/auth.js'
import projectsRoutes from './routes/projects.js'
import healthRoutes from './routes/health.js'
import statusRoutes from './routes/status.js'
import notificationsRoutes from './routes/notifications.js'
import staticFilesMiddleware from './middleware/static-files.js'
import deploysRoutes from './routes/deploys.js'
import automationsRoutes from './routes/automations.js'
import analyticsRoutes from './routes/analytics.js'
import logsRoutes from './routes/logs.js'
import agentsRoutes from './routes/agents.js'
import chatRoutes from './routes/chat.js'
import inboxRoutes from './routes/inbox.js'
import profileRoutes from './routes/profile.js'
import settingsRoutes from './routes/settings.js'
import marketplaceRoutes from './routes/marketplace.js'
// import visionRoutes from './routes/vision.js' // TODO: módulo de visão computacional incompleto
import { env } from './config/env.js'
import type { AppEnv } from './types/context.js'

const app = new Hono<AppEnv>()

app.use('*', requestId)
app.use(
  '*',
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5174'],
    credentials: true,
  })
)
app.use('*', errorHandler)

app.get('/', (c) => {
  return c.json({ message: 'Nommand Vision API', version: '1.0.0' })
})

app.route('/api/auth', authRoutes)
app.route('/api/projects', projectsRoutes)
app.route('/api/health', healthRoutes)
app.route('/api/status', statusRoutes)
app.route('/api/notifications', notificationsRoutes)
app.route('/api/deploys', deploysRoutes)
app.route('/api/automations', automationsRoutes)
app.route('/api/analytics', analyticsRoutes)
app.route('/api/logs', logsRoutes)
app.route('/api/agents', agentsRoutes)
app.route('/api/chat', chatRoutes)
app.route('/api/inbox', inboxRoutes)
app.route('/api/profile', profileRoutes)
app.route('/api/settings', settingsRoutes)
app.route('/api/marketplace', marketplaceRoutes)
// app.route('/api/vision', visionRoutes) // TODO: módulo de visão incompleto

export default app
