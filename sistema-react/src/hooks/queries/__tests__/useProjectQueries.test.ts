import { renderHook, waitFor } from '@testing-library/react'
import { useProjects, useProjectBySlug } from '../useProjectQueries'
import { createWrapper } from '@/test/utils'

describe('useProjectQueries', () => {
  describe('useProjects', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useProjects('Frontend'), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns projects data for a role', async () => {
      const { result } = renderHook(() => useProjects('Frontend'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data!.length).toBeGreaterThan(0)
      const project = result.current.data![0]
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('status')
      expect(project).toHaveProperty('stack')
      expect(project).toHaveProperty('role')
    })

    it('returns different projects for different roles', async () => {
      const wrapper = createWrapper()
      const { result: frontend } = renderHook(() => useProjects('Frontend'), { wrapper })
      const { result: backend } = renderHook(() => useProjects('Backend'), { wrapper })
      await waitFor(() => {
        expect(frontend.current.data).toBeDefined()
        expect(backend.current.data).toBeDefined()
      })
      expect(frontend.current.data![0].id).not.toBe(backend.current.data![0].id)
    })
  })

  describe('useProjectBySlug', () => {
    it('starts in loading state when slug is provided', () => {
      const { result } = renderHook(() => useProjectBySlug('landing-page-v2'), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(true)
    })

    it('returns a single project by slug', async () => {
      const { result } = renderHook(() => useProjectBySlug('landing-page-v2'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.data).toBeDefined())
      expect(result.current.data).toHaveProperty('id')
      expect(result.current.data).toHaveProperty('name')
    })

    it('does not fetch when slug is empty', () => {
      const { result } = renderHook(() => useProjectBySlug(''), { wrapper: createWrapper() })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
