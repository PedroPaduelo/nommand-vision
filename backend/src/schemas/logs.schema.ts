import { z } from 'zod'

export const listLogsSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).optional(),
  projectId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  source: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(50),
})

export const createLogSchema = z.object({
  projectId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
  source: z.string().max(100).optional(),
  traceId: z.string().max(100).optional(),
})

export const createLogBatchSchema = z.object({
  logs: z.array(createLogSchema).min(1).max(500),
})

export const searchLogsSchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(50),
})

export const cleanupLogsSchema = z.object({
  olderThanDays: z.coerce.number().min(1).max(365).default(30),
})

export type ListLogsInput = z.infer<typeof listLogsSchema>
export type CreateLogInput = z.infer<typeof createLogSchema>
export type CreateLogBatchInput = z.infer<typeof createLogBatchSchema>
export type SearchLogsInput = z.infer<typeof searchLogsSchema>
export type CleanupLogsInput = z.infer<typeof cleanupLogsSchema>
