import { renderHook, waitFor } from '@testing-library/react'
import { useMessages, useMessage } from '../useInboxQueries'
import { createWrapper } from '@/test/utils'

describe('useInboxQueries', () => {
  describe('useMessages', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useMessages(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns messages data', async () => {
      const { result } = renderHook(() => useMessages(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const msg = result.current.data![0]
      expect(msg).toHaveProperty('id')
      expect(msg).toHaveProperty('from')
      expect(msg).toHaveProperty('subject')
      expect(msg).toHaveProperty('tag')
      expect(msg).toHaveProperty('unread')
      expect(msg).toHaveProperty('body')
    })

    it('filters messages by filter string', async () => {
      const { result } = renderHook(() => useMessages('unread'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data!.every(m => m.unread)).toBe(true)
    })
  })

  describe('useMessage', () => {
    it('starts in loading state when id is valid', () => {
      const { result } = renderHook(() => useMessage(1), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns a single message by id', async () => {
      const { result } = renderHook(() => useMessage(1), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('id', 1)
      expect(result.current.data).toHaveProperty('subject')
      expect(result.current.data).toHaveProperty('body')
    })

    it('does not fetch when id is 0', () => {
      const { result } = renderHook(() => useMessage(0), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
