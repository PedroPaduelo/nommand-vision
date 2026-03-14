import { renderHook, waitFor } from '@testing-library/react'
import { useServices, useIncidents, useGlobalStatus } from '../useStatusQueries'
import { createWrapper } from '@/test/utils'

describe('useStatusQueries', () => {
  describe('useServices', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useServices(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns services data', async () => {
      const { result } = renderHook(() => useServices(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const svc = result.current.data![0]
      expect(svc).toHaveProperty('name')
      expect(svc).toHaveProperty('icon')
      expect(svc).toHaveProperty('desc')
      expect(svc).toHaveProperty('uptime')
      expect(svc).toHaveProperty('status')
    })
  })

  describe('useIncidents', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useIncidents(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns incidents data', async () => {
      const { result } = renderHook(() => useIncidents(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const incident = result.current.data![0]
      expect(incident).toHaveProperty('id')
      expect(incident).toHaveProperty('title')
      expect(incident).toHaveProperty('severity')
      expect(incident).toHaveProperty('status')
      expect(incident).toHaveProperty('updates')
      expect(Array.isArray(incident.updates)).toBe(true)
    })

    it('filters incidents by search', async () => {
      const { result } = renderHook(() => useIncidents('CDN'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data!.length).toBeGreaterThan(0)
      expect(result.current.data!.some(i => i.title.includes('CDN'))).toBe(true)
    })
  })

  describe('useGlobalStatus', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useGlobalStatus(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns global status data', async () => {
      const { result } = renderHook(() => useGlobalStatus(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('status')
      expect(result.current.data).toHaveProperty('uptime')
      expect(typeof result.current.data!.status).toBe('string')
      expect(typeof result.current.data!.uptime).toBe('string')
    })
  })
})
