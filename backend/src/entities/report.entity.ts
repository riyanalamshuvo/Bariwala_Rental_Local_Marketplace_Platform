import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @Column({ type: 'varchar', length: 30 })
  type: string; // 'fake_listing' | 'bad_behavior' | 'spam' | 'other'

  @Column({ name: 'target_type', type: 'varchar', length: 30 })
  targetType: string; // 'property' | 'marketplace_item' | 'user'

  @Column({ name: 'target_id' })
  targetId: string;

  @Column('text')
  reason: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending' | 'reviewed' | 'resolved' | 'dismissed'

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;
}
