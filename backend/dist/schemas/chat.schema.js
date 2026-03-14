import { z } from 'zod';
export const createSessionSchema = z.object({
    title: z.string().min(1).max(200).optional().default('Nova conversa'),
    model: z.string().max(50).optional(),
    projectId: z.string().uuid().optional(),
});
export const listSessionsSchema = z.object({
    projectId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(50).default(20),
});
export const sendMessageSchema = z.object({
    content: z.string().min(1),
    model: z.string().max(50).optional(),
});
