import { z } from 'zod';
export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().max(500).optional(),
    stack: z.array(z.string()).optional(),
    cpuLevel: z.number().min(1).max(3).optional(),
});
export const changePasswordSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
});
export const updateThemeSchema = z.object({
    theme: z.enum(['dark', 'light']),
});
