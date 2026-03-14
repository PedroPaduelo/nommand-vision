import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/notifications.service.ts'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => service.getNotifications(),
    staleTime: 30_000,
  })
}

export function useClearNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => service.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
