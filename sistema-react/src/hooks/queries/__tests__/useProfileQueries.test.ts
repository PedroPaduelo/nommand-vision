import { renderHook, waitFor } from '@testing-library/react'
import { useProfile, useContributions, useActivities, useSessions } from '../useProfileQueries'
import { createWrapper } from '@/test/utils'

describe('useProfileQueries', () => {
  describe('useProfile', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns profile data', async () => {
      const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('name')
      expect(result.current.data).toHaveProperty('bio')
      expect(result.current.data).toHaveProperty('handle')
      expect(result.current.data).toHaveProperty('role')
      expect(result.current.data).toHaveProperty('plan')
      expect(result.current.data).toHaveProperty('commits')
      expect(result.current.data).toHaveProperty('stack')
      expect(Array.isArray(result.current.data!.stack)).toBe(true)
    })
  })

  describe('useContributions', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useContributions(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns contributions data', async () => {
      const { result } = renderHook(() => useContributions(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const contribution = result.current.data![0]
      expect(contribution).toHaveProperty('count')
      expect(contribution).toHaveProperty('date')
    })
  })

  describe('useActivities', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useActivities(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns activities data', async () => {
      const { result } = renderHook(() => useActivities(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const activity = result.current.data![0]
      expect(activity).toHaveProperty('text')
      expect(activity).toHaveProperty('time')
      expect(activity).toHaveProperty('color')
    })

    it('filters activities by tag', async () => {
      const { result } = renderHook(() => useActivities('deploy'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data!.every(a => a.tag === 'deploy')).toBe(true)
    })
  })

  describe('useSessions', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useSessions(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns sessions data', async () => {
      const { result } = renderHook(() => useSessions(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const session = result.current.data![0]
      expect(session).toHaveProperty('device')
      expect(session).toHaveProperty('name')
      expect(session).toHaveProperty('current')
    })
  })
})
