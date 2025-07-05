'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { Comment as CommentType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useDeleteComment, useRestoreComment } from '@/hooks/useComments';
import { Button } from '@/components/ui/Button';
import { CommentForm } from './CommentForm';

interface CommentProps {
  comment: CommentType;
  level?: number;
  onReply?: () => void;
}

// Define indent levels for proper Tailwind compilation
const indentLevels = {
  0: '',
  1: 'ml-4 pl-4 border-l-2 border-slate-600',
  2: 'ml-8 pl-4 border-l-2 border-slate-600',
  3: 'ml-12 pl-4 border-l-2 border-slate-600',
  4: 'ml-16 pl-4 border-l-2 border-slate-600',
  5: 'ml-20 pl-4 border-l-2 border-slate-600',
} as const;

export function Comment({ comment, level = 0 }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const { user } = useAuth();
  const deleteComment = useDeleteComment();
  const restoreComment = useRestoreComment();

  const isOwner = user?.id === comment.authorId;
  const canModify = isOwner && canModifyComment(comment.createdAt) && !comment.isDeleted;
  const canRestore = isOwner && comment.isDeleted && comment.deletedAt && canRestoreComment(comment.deletedAt);

  console.log('Comment:', comment.id, 'isOwner:', isOwner, 'isDeleted:', comment.isDeleted, 'deletedAt:', comment.deletedAt, 'canRestore:', canRestore);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment.mutateAsync(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restoreComment.mutateAsync(comment.id);
    } catch (error) {
      console.error('Error restoring comment:', error);
    }
  };

  // Get proper indent class
  const indentClass = indentLevels[Math.min(level, 5) as keyof typeof indentLevels];

  // If comment is deleted and can't be restored, show minimal view
  if (comment.isDeleted && !canRestore) {
    return (
      <div className={`${indentClass} p-4 bg-slate-800/50 rounded-lg border border-slate-700`}>
        <p className="text-slate-400 italic">This comment has been deleted</p>
      </div>
    );
  }

  return (
    <div className={`${indentClass} space-y-4`}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold text-white">{comment.author.username}</span>
              <span className="text-slate-400 text-sm">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-slate-400 text-xs bg-slate-700 px-2 py-1 rounded">(edited)</span>
              )}
              {comment.isDeleted && (
                <span className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded border border-red-800">(deleted)</span>
              )}
            </div>
            
            {isEditing ? (
              <CommentForm
                editingComment={{ id: comment.id, content: comment.content }}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
              />
            ) : (
              <p className={`text-slate-100 leading-relaxed ${comment.isDeleted ? 'line-through opacity-60' : ''}`}>
                {comment.content}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700">
          {!comment.isDeleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Reply
            </Button>
          )}
          
          {canModify && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-slate-300 hover:text-green-400 hover:bg-green-500/10 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                disabled={deleteComment.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteComment.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
          
          {canRestore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestore}
              className="text-slate-300 hover:text-orange-400 hover:bg-orange-500/10 transition-colors border border-orange-500/30"
              disabled={restoreComment.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {restoreComment.isPending ? 'Restoring...' : 'Restore'}
            </Button>
          )}
        </div>

        {/* Reply form */}
        {isReplying && !comment.isDeleted && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <CommentForm
              parentId={comment.id}
              onCancel={() => setIsReplying(false)}
              onSuccess={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>
          
          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
function canModifyComment(createdAt: string): boolean {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  return new Date(createdAt) > fifteenMinutesAgo;
}

function canRestoreComment(deletedAt: string): boolean {
  const fifteenMinutesAfterDeletion = new Date(new Date(deletedAt).getTime() + 15 * 60 * 1000);
  return new Date() < fifteenMinutesAfterDeletion;
}
