import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, authorId: string): Promise<Comment> {
    // If it's a reply, verify parent exists
    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId, isDeleted: false },
        relations: ['author'],
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Create notification for parent comment author
      if (parentComment.authorId !== authorId) {
        await this.notificationsService.createReplyNotification(
          parentComment.authorId,
          createCommentDto.parentId,
          authorId,
        );
      }
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      authorId,
    });

    return this.commentRepository.save(comment);
  }

  async findAll(getCommentsDto: GetCommentsDto): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = getCommentsDto;
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { parentId: null, isDeleted: false }, // Only top-level comments
      relations: ['author', 'replies', 'replies.author', 'replies.replies'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Filter out deleted replies and nested replies
    const processedComments = comments.map(comment => ({
      ...comment,
      replies: comment.replies
        ?.filter(reply => !reply.isDeleted)
        .map(reply => ({
          ...reply,
          replies: reply.replies?.filter(nestedReply => !nestedReply.isDeleted) || [],
        })) || [],
    }));

    return {
      comments: processedComments as Comment[],
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.findById(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (!comment.canModify()) {
      throw new ForbiddenException('Comments can only be edited within 15 minutes of posting');
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const comment = await this.findById(id);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (!comment.canModify()) {
      throw new ForbiddenException('Comments can only be deleted within 15 minutes of posting');
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await this.commentRepository.save(comment);

    return { message: 'Comment deleted successfully. You can restore it within 15 minutes.' };
  }

  async restore(id: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, authorId: userId, isDeleted: true },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Deleted comment not found');
    }

    if (!comment.canRestore()) {
      throw new ForbiddenException('Comments can only be restored within 15 minutes of deletion');
    }

    comment.isDeleted = false;
    comment.deletedAt = null;
    return this.commentRepository.save(comment);
  }

  async getReplies(parentId: string, getCommentsDto: GetCommentsDto): Promise<{
    replies: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = getCommentsDto;
    const skip = (page - 1) * limit;

    // First, verify parent comment exists
    const parentComment = await this.commentRepository.findOne({
      where: { id: parentId, isDeleted: false },
    });

    if (!parentComment) {
      throw new NotFoundException('Parent comment not found');
    }

    const [replies, total] = await this.commentRepository.findAndCount({
      where: { parentId, isDeleted: false },
      relations: ['author', 'replies', 'replies.author'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    // Filter out deleted nested replies
    const processedReplies = replies.map(reply => ({
      ...reply,
      replies: reply.replies?.filter(nestedReply => !nestedReply.isDeleted) || [],
    }));

    return {
      replies: processedReplies as Comment[],
      total,
      page,
      limit,
    };
  }

  async getDeletedComments(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const now = new Date();
    const cutoff = new Date(now.getTime() - 15 * 60 * 1000);
    const qb = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.authorId = :userId', { userId })
      .andWhere('comment.isDeleted = true')
      .andWhere('comment.deletedAt IS NOT NULL')
      .andWhere('comment.deletedAt > :cutoff', { cutoff })
      .orderBy('comment.deletedAt', 'DESC')
      .skip(skip)
      .take(limit);
    const [comments, total] = await qb.getManyAndCount();
    return {
      comments,
      total,
      page,
      limit,
    };
  }
}
