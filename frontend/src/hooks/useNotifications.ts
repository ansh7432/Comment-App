import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { NotificationsResponse } from '@/types';

export function useNotifications(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async (): Promise<NotificationsResponse> => {
      const response = await api.get('/notifications', {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<{ unreadCount: number }> => {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<{ message: string }> => {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
