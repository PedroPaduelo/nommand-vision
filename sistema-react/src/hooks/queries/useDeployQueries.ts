import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/deploys.service.ts'

export function useDeploys(filter?: string) {
  return useQuery({
    queryKey: ['deploys', filter],
    queryFn: () => service.getDeploys(filter),
    staleTime: 30_000,
  })
}

export function useDeployById(num: number) {
  return useQuery({
    queryKey: ['deploy', num],
    queryFn: () => service.getDeployById(num),
    enabled: num > 0,
    staleTime: 30_000,
  })
}

export function useCancelDeploy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (num: number) => service.cancelDeploy(num),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploys'] })
    },
  })
}

export function useRollbackDeploy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (num: number) => service.rollbackDeploy(num),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploys'] })
    },
  })
}
