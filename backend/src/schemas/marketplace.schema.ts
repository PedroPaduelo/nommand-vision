import { z } from 'zod'

export const listMarketplaceSchema = z.object({
  category: z.enum(['agent', 'template', 'integration', 'plugin']).optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'downloads', 'rating', 'created']).default('created'),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(50).default(20),
})

export const rateItemSchema = z.object({
  rating: z.number().min(1).max(5),
})

export const installItemSchema = z.object({
  config: z.record(z.any()).optional(),
})

export type ListMarketplaceInput = z.infer<typeof listMarketplaceSchema>
export type RateItemInput = z.infer<typeof rateItemSchema>
export type InstallItemInput = z.infer<typeof installItemSchema>
