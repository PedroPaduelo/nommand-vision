import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/marketplace.service.ts'

export function useMarketplaceAgents(category?: string, search?: string) {
  return useQuery({
    queryKey: ['marketplace', 'agents', category, search],
    queryFn: () => service.getAgents(category, search),
    staleTime: 30_000,
  })
}

export function useMarketplaceCategories() {
  return useQuery({
    queryKey: ['marketplace', 'categories'],
    queryFn: () => service.getCategories(),
    staleTime: 30_000,
  })
}

export function useInstallAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.installAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
    },
  })
}
