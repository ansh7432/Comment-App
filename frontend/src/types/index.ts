export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  parentId: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: User;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  commentId: string;
  type: 'reply';
  isRead: boolean;
  message: string;
  createdAt: string;
  comment: Comment;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}
