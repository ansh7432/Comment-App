import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CommentsResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useDeletedComments(page: number = 1, limit: number = 20) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['deleted-comments', page, limit],
    queryFn: async (): Promise<CommentsResponse> => {
      const response = await api.get('/comments/deleted/history', {
        params: { page, limit },
      });
      return response.data;
    },
    enabled: !!user, // Only fetch when user is authenticated
  });
}
