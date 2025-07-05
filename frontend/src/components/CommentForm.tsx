'use client';

import React, { useState } from 'react';
import { useCreateComment, useUpdateComment } from '@/hooks/useComments';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface CommentFormProps {
  parentId?: string;
  editingComment?: {
    id: string;
    content: string;
  };
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function CommentForm({ parentId, editingComment, onCancel, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState(editingComment?.content || '');
  const { user } = useAuth();
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  const isEditing = !!editingComment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    try {
      if (isEditing) {
        await updateComment.mutateAsync({ id: editingComment.id, content });
      } else {
        await createComment.mutateAsync({ content, parentId });
      }
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg text-center border border-slate-700">
        <p className="text-slate-400">Please log in to comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Write a comment..."}
        className="min-h-[100px] bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        required
      />
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={!content.trim() || createComment.isPending || updateComment.isPending}
          className="bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          {createComment.isPending || updateComment.isPending ? 'Submitting...' : isEditing ? 'Update' : 'Comment'}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
