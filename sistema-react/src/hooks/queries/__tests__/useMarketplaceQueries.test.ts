import { renderHook, waitFor } from '@testing-library/react'
import { useMarketplaceAgents, useMarketplaceCategories } from '../useMarketplaceQueries'
import { createWrapper } from '@/test/utils'

describe('useMarketplaceQueries', () => {
  describe('useMarketplaceAgents', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useMarketplaceAgents(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns marketplace agents data', async () => {
      const { result } = renderHook(() => useMarketplaceAgents(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const agent = result.current.data![0]
      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('author')
      expect(agent).toHaveProperty('cat')
      expect(agent).toHaveProperty('stars')
      expect(agent).toHaveProperty('downloads')
      expect(agent).toHaveProperty('tags')
      expect(agent).toHaveProperty('verified')
    })

    it('filters agents by category', async () => {
      const { result } = renderHook(() => useMarketplaceAgents('security'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data!.every(a => a.cat === 'security')).toBe(true)
    })
  })

  describe('useMarketplaceCategories', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useMarketplaceCategories(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns categories as string array', async () => {
      const { result } = renderHook(() => useMarketplaceCategories(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      expect(result.current.data!).toContain('all')
    })
  })
})
