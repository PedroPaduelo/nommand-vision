import { useQuery } from '@tanstack/react-query'
import * as service from '@/services/analytics.service.ts'

export function useMetrics(period: string) {
  return useQuery({
    queryKey: ['analytics', 'metrics', period],
    queryFn: () => service.getMetrics(period),
    staleTime: 30_000,
  })
}

export function useEndpoints() {
  return useQuery({
    queryKey: ['analytics', 'endpoints'],
    queryFn: () => service.getEndpoints(),
    staleTime: 30_000,
  })
}

export function useGeoData() {
  return useQuery({
    queryKey: ['analytics', 'geo'],
    queryFn: () => service.getGeoData(),
    staleTime: 30_000,
  })
}

export function usePeriodData(period: string) {
  return useQuery({
    queryKey: ['analytics', 'period', period],
    queryFn: () => service.getPeriodData(period),
    staleTime: 30_000,
  })
}
