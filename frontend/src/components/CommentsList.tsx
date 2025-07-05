'use client';

import React, { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { Comment } from './Comment';
import { CommentForm } from './CommentForm';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function CommentsList() {
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { data: commentsData, isLoading, error } = useComments(page, 20);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-lg text-slate-300">Please log in to view and participate in discussions.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-700 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-400">Error loading comments. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* New Comment Form */}
      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Start a Discussion</h2>
        <CommentForm />
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">
          Comments ({commentsData?.total || 0})
        </h2>

        {commentsData?.comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {commentsData?.comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {commentsData && commentsData.total > commentsData.limit && (
          <div className="flex justify-center items-center space-x-4 pt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Previous
            </Button>
            
            <span className="text-sm text-slate-400">
              Page {page} of {Math.ceil(commentsData.total / commentsData.limit)}
            </span>
            
            <Button
              variant="outline"
              disabled={page >= Math.ceil(commentsData.total / commentsData.limit)}
              onClick={() => setPage(page + 1)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
