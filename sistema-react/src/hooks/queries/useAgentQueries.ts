import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/agents.service.ts'
import type { Agent } from '@/types/index.ts'

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => service.getAgents(),
    staleTime: 30_000,
  })
}

export function useAgentById(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => service.getAgentById(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Agent>) => service.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

export function useStartAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.startAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

export function useStopAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.stopAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}
