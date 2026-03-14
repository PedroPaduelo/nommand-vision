import { z } from 'zod';
export const dashboardSchema = z.object({
    period: z.enum(['7d', '30d', '90d']).default('30d'),
});
export const timeseriesSchema = z.object({
    metric: z.enum(['deploys', 'messages', 'agents', 'uptime', 'errors']),
    period: z.enum(['7d', '30d', '90d']).default('30d'),
});
export const trackEventSchema = z.object({
    projectId: z.string().uuid().optional(),
    eventType: z.string().min(1).max(50),
    eventData: z.record(z.unknown()).optional(),
});
