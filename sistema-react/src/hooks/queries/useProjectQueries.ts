import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/projects.service.ts'
import type { Project } from '@/types/index.ts'

export function useProjects(role: string) {
  return useQuery({
    queryKey: ['projects', role],
    queryFn: () => service.getProjects(role),
    staleTime: 30_000,
  })
}

export function useProjectBySlug(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => service.getProjectBySlug(slug),
    enabled: !!slug,
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => service.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
