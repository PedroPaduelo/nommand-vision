import { renderHook, waitFor } from '@testing-library/react'
import { useSettings, useIntegrations, useApiKeys, useBilling } from '../useSettingsQueries'
import { createWrapper } from '@/test/utils'

describe('useSettingsQueries', () => {
  describe('useSettings', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns settings data', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('workspaceName')
      expect(result.current.data).toHaveProperty('region')
      expect(result.current.data).toHaveProperty('theme')
      expect(result.current.data).toHaveProperty('accentColor')
      expect(result.current.data).toHaveProperty('font')
      expect(result.current.data).toHaveProperty('devMode')
      expect(typeof result.current.data!.autoSave).toBe('boolean')
    })
  })

  describe('useIntegrations', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useIntegrations(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns integrations data', async () => {
      const { result } = renderHook(() => useIntegrations(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const integration = result.current.data![0]
      expect(integration).toHaveProperty('key')
      expect(integration).toHaveProperty('name')
      expect(integration).toHaveProperty('desc')
      expect(integration).toHaveProperty('connected')
    })
  })

  describe('useApiKeys', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns api keys data', async () => {
      const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const apiKey = result.current.data![0]
      expect(apiKey).toHaveProperty('key')
      expect(apiKey).toHaveProperty('status')
      expect(apiKey).toHaveProperty('date')
    })
  })

  describe('useBilling', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useBilling(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns billing data', async () => {
      const { result } = renderHook(() => useBilling(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('plan')
      expect(result.current.data).toHaveProperty('price')
      expect(result.current.data).toHaveProperty('features')
      expect(result.current.data).toHaveProperty('nextPayment')
      expect(result.current.data).toHaveProperty('paymentMethod')
      expect(result.current.data).toHaveProperty('usage')
      expect(Array.isArray(result.current.data!.features)).toBe(true)
      expect(Array.isArray(result.current.data!.usage)).toBe(true)
    })
  })
})
