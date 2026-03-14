import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/automations.service.ts'
import type { Workflow } from '@/types/index.ts'

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => service.getWorkflows(),
    staleTime: 30_000,
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Workflow>) => service.createWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}

export function useToggleWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.toggleWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}
