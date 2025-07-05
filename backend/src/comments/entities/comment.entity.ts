import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
@Index(['authorId'])
@Index(['parentId'])
@Index(['createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string | null;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment | null;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];

  // Helper method to check if edit/delete is allowed (15 minutes)
  canModify(): boolean {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return this.createdAt > fifteenMinutesAgo && !this.isDeleted;
  }

  // Helper method to check if restore is allowed (15 minutes after deletion)
  canRestore(): boolean {
    if (!this.isDeleted || !this.deletedAt) return false;
    const fifteenMinutesAfterDeletion = new Date(this.deletedAt.getTime() + 15 * 60 * 1000);
    return new Date() < fifteenMinutesAfterDeletion;
  }
}
