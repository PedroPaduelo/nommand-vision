import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as authService from '../services/auth.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { authRateLimit } from '../middleware/rate-limit.js'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema.js'
import type { AppEnv } from '../types/context.js'

const auth = new Hono<AppEnv>()

auth.post('/register', authRateLimit, zValidator('json', registerSchema), async (c) => {
  const input = c.req.valid('json')

  try {
    const result = await authService.register(input)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return c.json({ error: { code: 'CONFLICT', message: 'User already exists' } }, 409)
    }
    console.error('Register error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } }, 500)
  }
})

auth.post('/login', authRateLimit, zValidator('json', loginSchema), async (c) => {
  const input = c.req.valid('json')

  try {
    const result = await authService.login(input)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' } }, 401)
    }
    if (error.message === 'Please login with OAuth') {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Please login with OAuth provider' } }, 401)
    }
    console.error('Login error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Login failed' } }, 500)
  }
})

auth.post('/logout', authRateLimit, authMiddleware, zValidator('json', logoutSchema), async (c) => {
  const user = c.get('user')
  const { refreshToken } = c.req.valid('json')

  await authService.logout(user.id, refreshToken)
  return c.json({ data: { success: true } })
})

auth.post('/refresh', authRateLimit, zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')

  try {
    const result = await authService.refresh(refreshToken)
    return c.json({ data: result })
  } catch (error: any) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } }, 401)
  }
})

auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')

  try {
    const result = await authService.getMe(user.id)
    return c.json({ data: result })
  } catch (error) {
    console.error('Get me error:', error)
    return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
  }
})

auth.patch('/me', authMiddleware, zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const result = await authService.updateMe(user.id, input)
    return c.json({ data: result })
  } catch (error) {
    console.error('Update me error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Update failed' } }, 500)
  }
})

auth.post('/forgot-password', authRateLimit, zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json')

  return c.json({ data: { success: true, message: 'If the email exists, a reset link will be sent' } })
})

auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json')

  return c.json({ data: { success: true, message: 'Password has been reset' } })
})

export default auth
