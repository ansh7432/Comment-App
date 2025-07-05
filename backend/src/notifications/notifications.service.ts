import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
  ) {}

  async createReplyNotification(
    userId: string,
    commentId: string,
    replierUserId: string,
  ): Promise<void> {
    const replier = await this.usersService.findById(replierUserId);
    if (!replier) return;

    const notification = this.notificationRepository.create({
      userId,
      commentId,
      type: NotificationType.REPLY,
      message: `${replier.username} replied to your comment`,
    });

    await this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      relations: ['comment', 'comment.author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}
