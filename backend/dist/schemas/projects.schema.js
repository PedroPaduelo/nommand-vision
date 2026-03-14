import { z } from 'zod';
export const createProjectSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    icon: z.string().max(10).optional(),
    iconColor: z.string().max(7).optional(),
    status: z.enum(['active', 'draft']).optional(),
    branch: z.string().max(100).optional(),
    framework: z.string().max(50).optional(),
    stack: z.array(z.string()).optional(),
    role: z.enum(['Frontend', 'Backend', 'Design', 'Data']).optional(),
});
export const updateProjectSchema = createProjectSchema.partial();
export const listProjectsSchema = z.object({
    status: z.enum(['active', 'draft']).optional(),
    role: z.enum(['Frontend', 'Backend', 'Design', 'Data']).optional(),
    page: z.coerce.number().min(1).default(1),
    perPage: z.coerce.number().min(1).max(50).default(20),
});
