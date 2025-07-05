'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { useDeletedComments } from '@/hooks/useDeletedComments';
import { useRestoreComment } from '@/hooks/useComments';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData } = useNotifications(1, 10);
  const { data: deletedData, isLoading: loadingDeleted, isError: errorDeleted, refetch: refetchDeleted } = useDeletedComments(1, 10);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const restoreComment = useRestoreComment();
  const deletedDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        deletedDropdownRef.current &&
        !deletedDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDeleted(false);
      }
    }
    if (showDeleted) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleted]);

  const handleNotificationClick = async (notificationId: string) => {
    if (!notificationsData?.notifications.find(n => n.id === notificationId)?.isRead) {
      await markAsRead.mutateAsync(notificationId);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  const handleRestore = async (commentId: string) => {
    setRestoreError(null);
    try {
      await restoreComment.mutateAsync(commentId);
      setShowDeleted(false); // Close dropdown after restore
      refetchDeleted(); // Refresh deleted comments
    } catch {
      setRestoreError('Failed to restore comment. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div>
            <h1 className="text-xl font-semibold text-white">Comment App</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadData && unreadData.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white">Notifications</h3>
                      {notificationsData?.notifications.some(n => !n.isRead) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notificationsData?.notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">
                        No notifications
                      </div>
                    ) : (
                      notificationsData?.notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-blue-500/10 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <p className="text-sm text-white">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete History */}
            <div className="relative" ref={deletedDropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleted(!showDeleted)}
                className="relative text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Delete History"
              >
                <Trash2 className="w-5 h-5" />
                {deletedData?.total ? (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {deletedData.total > 9 ? '9+' : deletedData.total}
                  </span>
                ) : null}
              </Button>
              {showDeleted && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-medium text-white">Delete History</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loadingDeleted ? (
                      <div className="p-4 text-center text-slate-400">Loading...</div>
                    ) : errorDeleted ? (
                      <div className="p-4 text-center text-red-400">Failed to load deleted comments.</div>
                    ) : !deletedData?.comments || deletedData.comments.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No recently deleted comments</div>
                    ) : (
                      deletedData.comments.map((comment) => {
                        // If deletedAt is more than 15 minutes ago, show as expired (shouldn't happen, but for safety)
                        const deletedAgo = comment.deletedAt ? (Date.now() - new Date(comment.deletedAt).getTime()) / 1000 / 60 : 0;
                        const expired = deletedAgo > 15;
                        return (
                          <div key={comment.id} className="p-4 border-b border-slate-700 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate max-w-xs" title={comment.content}>{comment.content}</span>
                              <span className="text-xs text-slate-400">{comment.deletedAt && formatDistanceToNow(new Date(comment.deletedAt), { addSuffix: true })}</span>
                            </div>
                            {expired ? (
                              <span className="text-xs text-slate-500 italic">Restore window expired</span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestore(comment.id)}
                                disabled={restoreComment.isPending}
                                className="text-orange-400 border border-orange-500/30 hover:text-orange-300 hover:bg-orange-500/10 w-fit"
                              >
                                {restoreComment.isPending ? 'Restoring...' : 'Restore'}
                              </Button>
                            )}
                          </div>
                        );
                      })
                    )}
                    {restoreError && (
                      <div className="p-2 text-center text-red-400 text-xs">{restoreError}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(!showProfile)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </Button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                  <div className="p-4 border-b border-slate-700">
                    <p className="font-medium text-white">{user.username}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
