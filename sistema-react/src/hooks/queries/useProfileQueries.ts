import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/profile.service.ts'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => service.getProfile(),
    staleTime: 30_000,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; bio?: string }) => service.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useContributions() {
  return useQuery({
    queryKey: ['profile', 'contributions'],
    queryFn: () => service.getContributions(),
    staleTime: 30_000,
  })
}

export function useActivities(filter?: string) {
  return useQuery({
    queryKey: ['profile', 'activities', filter],
    queryFn: () => service.getActivities(filter),
    staleTime: 30_000,
  })
}

export function useSessions() {
  return useQuery({
    queryKey: ['profile', 'sessions'],
    queryFn: () => service.getSessions(),
    staleTime: 30_000,
  })
}
