import { renderHook, waitFor } from '@testing-library/react'
import { useDeploys, useDeployById } from '../useDeployQueries'
import { createWrapper } from '@/test/utils'

describe('useDeployQueries', () => {
  describe('useDeploys', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useDeploys(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns deploys data', async () => {
      const { result } = renderHook(() => useDeploys(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const deploy = result.current.data![0]
      expect(deploy).toHaveProperty('num')
      expect(deploy).toHaveProperty('env')
      expect(deploy).toHaveProperty('branch')
      expect(deploy).toHaveProperty('status')
      expect(deploy).toHaveProperty('deployer')
    })

    it('filters deploys by environment', async () => {
      const { result } = renderHook(() => useDeploys('prod'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data!.every(d => d.env === 'prod')).toBe(true)
    })
  })

  describe('useDeployById', () => {
    it('starts in loading state when id is valid', () => {
      const { result } = renderHook(() => useDeployById(47), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns a single deploy by number', async () => {
      const { result } = renderHook(() => useDeployById(47), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('num', 47)
      expect(result.current.data).toHaveProperty('env')
      expect(result.current.data).toHaveProperty('status')
    })

    it('does not fetch when num is 0', () => {
      const { result } = renderHook(() => useDeployById(0), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
