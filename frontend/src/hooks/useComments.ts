import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CommentsResponse, Comment } from '@/types';

export function useComments(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['comments', page, limit],
    queryFn: async (): Promise<CommentsResponse> => {
      const response = await api.get('/comments', {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

export function useComment(id: string) {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: async (): Promise<Comment> => {
      const response = await api.get(`/comments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { content: string; parentId?: string }): Promise<Comment> => {
      const response = await api.post('/comments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }): Promise<Comment> => {
      const response = await api.put(`/comments/${id}`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useRestoreComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<Comment> => {
      const response = await api.patch(`/comments/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useCommentReplies(parentId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['comment-replies', parentId, page, limit],
    queryFn: async (): Promise<CommentsResponse> => {
      const response = await api.get(`/comments/${parentId}/replies`, {
        params: { page, limit },
      });
      return response.data;
    },
    enabled: !!parentId,
  });
}
