import { renderHook, waitFor } from '@testing-library/react'
import { useLogs, useAlerts } from '../useLogQueries'
import { createWrapper } from '@/test/utils'

describe('useLogQueries', () => {
  describe('useLogs', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useLogs(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns log entries', async () => {
      const { result } = renderHook(() => useLogs(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const log = result.current.data![0]
      expect(log).toHaveProperty('id')
      expect(log).toHaveProperty('timestamp')
      expect(log).toHaveProperty('level')
      expect(log).toHaveProperty('source')
      expect(log).toHaveProperty('message')
    })

    it('filters logs by level', async () => {
      const { result } = renderHook(() => useLogs({ level: 'ERROR' }), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data!.every(l => l.level === 'ERROR')).toBe(true)
    })
  })

  describe('useAlerts', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns alerts data', async () => {
      const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const alert = result.current.data![0]
      expect(alert).toHaveProperty('id')
      expect(alert).toHaveProperty('sev')
      expect(alert).toHaveProperty('title')
      expect(alert).toHaveProperty('desc')
      expect(alert).toHaveProperty('time')
    })
  })
})
