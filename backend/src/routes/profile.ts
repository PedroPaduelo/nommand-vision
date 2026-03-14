import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as profileService from '../services/profile.service.js'
import { authMiddleware } from '../middleware/auth.js'
import { updateProfileSchema, changePasswordSchema, updateThemeSchema } from '../schemas/profile.schema.js'
import type { AppEnv } from '../types/context.js'

const profileRouter = new Hono<AppEnv>()

profileRouter.use('/*', authMiddleware)

// GET /api/profile
profileRouter.get('/', async (c) => {
  const user = c.get('user')

  try {
    const profile = await profileService.getProfile(user.id)
    return c.json({ data: profile })
  } catch (error: any) {
    if (error.message === 'User not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    console.error('Get profile error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get profile' } }, 500)
  }
})

// PATCH /api/profile
profileRouter.patch('/', zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const profile = await profileService.updateProfile(user.id, input)
    return c.json({ data: profile })
  } catch (error: any) {
    if (error.message === 'User not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    console.error('Update profile error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } }, 500)
  }
})

// POST /api/profile/password
profileRouter.post('/password', zValidator('json', changePasswordSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const result = await profileService.changePassword(user.id, input)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'Invalid current password') {
      return c.json({ error: { code: 'INVALID_PASSWORD', message: 'Invalid current password' } }, 400)
    }
    console.error('Change password error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to change password' } }, 500)
  }
})

// POST /api/profile/onboarding
profileRouter.post('/onboarding', async (c) => {
  const user = c.get('user')

  try {
    const result = await profileService.completeOnboarding(user.id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'User not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    console.error('Complete onboarding error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to complete onboarding' } }, 500)
  }
})

// POST /api/profile/tour
profileRouter.post('/tour', async (c) => {
  const user = c.get('user')

  try {
    const result = await profileService.completeTour(user.id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'User not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    console.error('Complete tour error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to complete tour' } }, 500)
  }
})

// PATCH /api/profile/theme
profileRouter.patch('/theme', zValidator('json', updateThemeSchema), async (c) => {
  const user = c.get('user')
  const input = c.req.valid('json')

  try {
    const result = await profileService.updateTheme(user.id, input)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'User not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    console.error('Update theme error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update theme' } }, 500)
  }
})

// DELETE /api/profile
profileRouter.delete('/', async (c) => {
  const user = c.get('user')

  try {
    const result = await profileService.deleteAccount(user.id)
    return c.json({ data: result })
  } catch (error: any) {
    if (error.message === 'User not found') {
      return c.json({ error: { code: 'NOT_FOUND', message: 'User not found' } }, 404)
    }
    console.error('Delete account error:', error)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' } }, 500)
  }
})

export default profileRouter
