import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const refreshSchema = z.object({
  refreshToken: z.string(),
})

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['Frontend', 'Backend', 'Design', 'Data']).optional(),
  stack: z.array(z.string()).optional(),
  cpuLevel: z.number().min(1).max(3).optional(),
  onboarded: z.boolean().optional(),
  theme: z.enum(['dark', 'light']).optional(),
  tourDone: z.boolean().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
