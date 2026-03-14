import { renderHook, waitFor } from '@testing-library/react'
import { useNotifications } from '../useNotificationQueries'
import { createWrapper } from '@/test/utils'

describe('useNotificationQueries', () => {
  describe('useNotifications', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns notifications data', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const notification = result.current.data![0]
      expect(notification).toHaveProperty('id')
      expect(notification).toHaveProperty('icon')
      expect(notification).toHaveProperty('iconColor')
      expect(notification).toHaveProperty('title')
      expect(notification).toHaveProperty('desc')
      expect(notification).toHaveProperty('unread')
    })
  })
})
