import { z } from 'zod';
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(100),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export const refreshSchema = z.object({
    refreshToken: z.string(),
});
export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});
export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8),
});
export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    role: z.enum(['Frontend', 'Backend', 'Design', 'Data']).optional(),
    stack: z.array(z.string()).optional(),
    cpuLevel: z.number().min(1).max(3).optional(),
    onboarded: z.boolean().optional(),
    theme: z.enum(['dark', 'light']).optional(),
    tourDone: z.boolean().optional(),
});
