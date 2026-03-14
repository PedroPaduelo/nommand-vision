import { z } from 'zod'

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
})

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(100),
  permissions: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
})

export const updateApiKeySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  permissions: z.array(z.string()).optional(),
})

export const createWebhookSchema = z.object({
  name: z.string().min(2).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(8).optional(),
})

export const updateWebhookSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  secret: z.string().min(8).optional(),
  active: z.boolean().optional(),
})

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>
