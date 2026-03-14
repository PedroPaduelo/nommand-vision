import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url().max(500).optional(),
  type: z.enum(['api', 'database', 'worker', 'external']).optional(),
  status: z.enum(['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance']).optional(),
})

export const updateServiceSchema = createServiceSchema.partial()

export const createIncidentSchema = z.object({
  serviceId: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
})

export const updateIncidentSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
})

export const listIncidentsSchema = z.object({
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
  severity: z.enum(['minor', 'major', 'critical']).optional(),
  serviceId: z.string().uuid().optional(),
})

export const uptimeQuerySchema = z.object({
  days: z.coerce.number().min(1).max(90).default(30),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>
export type ListIncidentsInput = z.infer<typeof listIncidentsSchema>
