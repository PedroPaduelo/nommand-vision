import { renderHook, waitFor } from '@testing-library/react'
import { useMetrics, useEndpoints, useGeoData, usePeriodData } from '../useAnalyticsQueries'
import { createWrapper } from '@/test/utils'

describe('useAnalyticsQueries', () => {
  describe('useMetrics', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useMetrics('7d'), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns metrics data', async () => {
      const { result } = renderHook(() => useMetrics('7d'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('totalRequests')
      expect(result.current.data).toHaveProperty('avgLatency')
      expect(result.current.data).toHaveProperty('errorRate')
      expect(result.current.data).toHaveProperty('uptime')
    })
  })

  describe('useEndpoints', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useEndpoints(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns endpoints data', async () => {
      const { result } = renderHook(() => useEndpoints(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const endpoint = result.current.data![0]
      expect(endpoint).toHaveProperty('endpoint')
      expect(endpoint).toHaveProperty('requests')
      expect(endpoint).toHaveProperty('latency')
      expect(endpoint).toHaveProperty('error')
      expect(endpoint).toHaveProperty('p99')
      expect(endpoint).toHaveProperty('status')
    })
  })

  describe('useGeoData', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useGeoData(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns geo data', async () => {
      const { result } = renderHook(() => useGeoData(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const geo = result.current.data![0]
      expect(geo).toHaveProperty('name')
      expect(geo).toHaveProperty('value')
      expect(geo).toHaveProperty('flag')
    })
  })

  describe('usePeriodData', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => usePeriodData('7d'), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns period data with arrays', async () => {
      const { result } = renderHook(() => usePeriodData('7d'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('labels')
      expect(result.current.data).toHaveProperty('requests')
      expect(result.current.data).toHaveProperty('latency')
      expect(result.current.data).toHaveProperty('errors')
      expect(Array.isArray(result.current.data!.labels)).toBe(true)
      expect(Array.isArray(result.current.data!.requests)).toBe(true)
    })
  })
})
