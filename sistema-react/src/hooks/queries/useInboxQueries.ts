import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as service from '@/services/inbox.service.ts'

export function useMessages(filter?: string) {
  return useQuery({
    queryKey: ['messages', filter],
    queryFn: () => service.getMessages(filter),
    staleTime: 30_000,
  })
}

export function useMessage(id: number) {
  return useQuery({
    queryKey: ['message', id],
    queryFn: () => service.getMessage(id),
    enabled: id > 0,
    staleTime: 30_000,
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => service.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useMarkUnread() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => service.markUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useArchiveMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => service.archiveMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => service.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}
