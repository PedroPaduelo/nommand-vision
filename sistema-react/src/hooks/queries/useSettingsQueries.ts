import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/settings.service.ts'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => service.getSettings(),
    staleTime: 30_000,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof service.updateSettings>[0]) => service.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: () => service.getIntegrations(),
    staleTime: 30_000,
  })
}

export function useToggleIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => service.toggleIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] })
    },
  })
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => service.generateApiKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'apiKeys'] })
    },
  })
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['settings', 'apiKeys'],
    queryFn: () => service.getApiKeys(),
    staleTime: 30_000,
  })
}

export function useBilling() {
  return useQuery({
    queryKey: ['settings', 'billing'],
    queryFn: () => service.getBilling(),
    staleTime: 30_000,
  })
}
