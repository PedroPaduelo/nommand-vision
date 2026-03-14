import { renderHook, waitFor } from '@testing-library/react'
import { useWorkflows } from '../useAutomationQueries'
import { createWrapper } from '@/test/utils'

describe('useAutomationQueries', () => {
  describe('useWorkflows', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useWorkflows(), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns workflows data', async () => {
      const { result } = renderHook(() => useWorkflows(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const workflow = result.current.data![0]
      expect(workflow).toHaveProperty('id')
      expect(workflow).toHaveProperty('name')
      expect(workflow).toHaveProperty('type')
      expect(workflow).toHaveProperty('active')
      expect(workflow).toHaveProperty('steps')
      expect(workflow).toHaveProperty('executions')
      expect(workflow).toHaveProperty('successRate')
      expect(Array.isArray(workflow.steps)).toBe(true)
    })
  })
})
