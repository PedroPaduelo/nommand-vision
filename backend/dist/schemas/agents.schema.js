import { z } from 'zod';
export const createAgentSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    type: z.enum(['assistant', 'custom', 'tool', 'supervisor']).default('custom'),
    model: z.string().max(50).optional(),
    systemPrompt: z.string().optional(),
    config: z.record(z.unknown()).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(1).max(128000).optional(),
    tools: z.array(z.string()).optional(),
    iconColor: z.string().max(7).optional(),
    isActive: z.boolean().default(true),
    category: z.enum(['dev', 'review', 'qa', 'deploy', 'custom']).optional().default('custom'),
});
export const updateAgentSchema = createAgentSchema.partial();
export const listAgentsSchema = z.object({
    category: z.enum(['dev', 'review', 'qa', 'deploy', 'custom']).optional(),
    status: z.enum(['active', 'inactive', 'error']).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
});
export const runAgentSchema = z.object({
    input: z.string().min(1),
    projectId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
});
