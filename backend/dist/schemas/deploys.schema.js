import { z } from 'zod';
export const createDeploySchema = z.object({
    projectId: z.string().uuid(),
    environment: z.enum(['preview', 'staging', 'production']).optional().default('preview'),
    commitSha: z.string().max(40).optional(),
    commitMessage: z.string().optional(),
    branch: z.string().max(100).optional(),
});
export const listDeploysSchema = z.object({
    projectId: z.string().uuid().optional(),
    status: z.enum(['queued', 'building', 'deploying', 'success', 'failed', 'cancelled']).optional(),
    environment: z.enum(['preview', 'staging', 'production']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
});
export const setEnvVarSchema = z.object({
    key: z.string().min(1).max(100),
    value: z.string().min(1),
    isSecret: z.boolean().optional().default(true),
});
