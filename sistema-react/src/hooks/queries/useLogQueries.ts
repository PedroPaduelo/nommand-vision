import { useQuery } from '@tanstack/react-query'
import * as service from '@/services/logs.service.ts'

export function useLogs(filter?: { level?: string; search?: string }) {
  return useQuery({
    queryKey: ['logs', filter],
    queryFn: () => service.getLogs(filter),
    staleTime: 30_000,
  })
}

export function useAlerts() {
  return useQuery({
    queryKey: ['logs', 'alerts'],
    queryFn: () => service.getAlerts(),
    staleTime: 30_000,
  })
}
