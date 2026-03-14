import { renderHook, waitFor } from '@testing-library/react'
import { useAgents, useAgentById } from '../useAgentQueries'
import { createWrapper } from '@/test/utils'

describe('useAgentQueries', () => {
  describe('useAgents', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns agents data', async () => {
      const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const agent = result.current.data![0]
      expect(agent).toHaveProperty('id')
      expect(agent).toHaveProperty('name')
      expect(agent).toHaveProperty('status')
      expect(agent).toHaveProperty('model')
      expect(agent).toHaveProperty('type')
      expect(agent).toHaveProperty('tasks')
    })
  })

  describe('useAgentById', () => {
    it('starts in loading state when id is provided', () => {
      const { result } = renderHook(() => useAgentById('ag-1'), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns a single agent by id', async () => {
      const { result } = renderHook(() => useAgentById('ag-1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('id', 'ag-1')
      expect(result.current.data).toHaveProperty('name')
      expect(result.current.data).toHaveProperty('status')
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useAgentById(''), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
