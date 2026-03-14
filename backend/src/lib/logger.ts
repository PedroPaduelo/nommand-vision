import { env } from '../config/env.js'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'refreshToken', 'accessToken', 'token',
  'authorization', 'secret', 'key', 'jwt'
])

function sanitize(obj: any, depth = 0): any {
  if (depth > 5) return { /* max recursion */ }
  if (obj == null) return obj
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item, depth + 1))
  }

  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('token') || lowerKey.includes('secret')) {
      sanitized[key] = '***REDACTED***'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value, depth + 1)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): string {
  const timestamp = new Date().toISOString()
  const logObj = { timestamp, level, message, ...(meta && sanitize(meta)) }

  if (env.NODE_ENV === 'production' || process.env.JSON_LOGS === 'true') {
    return JSON.stringify(logObj)
  }

  const colors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m',  // green
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m', // red
  }
  const reset = '\x1b[0m'
  const metaStr = meta ? ` ${JSON.stringify(sanitize(meta), null, 2)}` : ''
  return `${colors[level]}${level.toUpperCase()}${reset} ${timestamp} ${message}${metaStr}`
}

export const logger = {
  debug: (message: string, meta?: Record<string, any>) => console.debug(formatMessage('debug', message, meta)),
  info: (message: string, meta?: Record<string, any>) => console.info(formatMessage('info', message, meta)),
  warn: (message: string, meta?: Record<string, any>) => console.warn(formatMessage('warn', message, meta)),
  error: (message: string, meta?: Record<string, any>) => console.error(formatMessage('error', message, meta)),
}

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason })
})

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack })
})
