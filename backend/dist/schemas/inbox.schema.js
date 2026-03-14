import { z } from 'zod';
export const listInboxSchema = z.object({
    type: z.enum(['info', 'warning', 'error', 'success', 'action']).optional(),
    read: z.enum(['true', 'false']).optional(),
    archived: z.enum(['true', 'false']).optional().default('false'),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(50).default(20),
});
export const createInboxSchema = z.object({
    toUserId: z.string().uuid().optional(),
    fromAgentId: z.string().uuid().optional(),
    type: z.enum(['info', 'warning', 'error', 'success', 'action']).default('info'),
    subject: z.string().min(1).max(200),
    body: z.string().optional(),
    actionUrl: z.string().max(500).optional(),
    metadata: z.record(z.unknown()).optional(),
});
