import { useQuery } from '@tanstack/react-query'
import * as service from '@/services/status.service.ts'

export function useServices() {
  return useQuery({
    queryKey: ['status', 'services'],
    queryFn: () => service.getServices(),
    staleTime: 30_000,
  })
}

export function useIncidents(search?: string) {
  return useQuery({
    queryKey: ['status', 'incidents', search],
    queryFn: () => service.getIncidents(search),
    staleTime: 30_000,
  })
}

export function useGlobalStatus() {
  return useQuery({
    queryKey: ['status', 'global'],
    queryFn: () => service.getGlobalStatus(),
    refetchInterval: 30000,
    staleTime: 30_000,
  })
}
