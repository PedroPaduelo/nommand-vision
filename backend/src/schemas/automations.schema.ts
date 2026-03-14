import { z } from 'zod'

export const createAutomationSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  triggerType: z.enum(['schedule', 'webhook', 'event', 'manual']),
  triggerConfig: z.record(z.any()).optional(),
  actions: z.array(z.record(z.any())).optional().default([]),
  enabled: z.boolean().optional().default(true),
})

export const updateAutomationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  triggerType: z.enum(['schedule', 'webhook', 'event', 'manual']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  actions: z.array(z.record(z.any())).optional(),
  enabled: z.boolean().optional(),
})

export const listAutomationsSchema = z.object({
  triggerType: z.enum(['schedule', 'webhook', 'event', 'manual']).optional(),
  enabled: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(50).default(20),
})

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>
export type ListAutomationsInput = z.infer<typeof listAutomationsSchema>
