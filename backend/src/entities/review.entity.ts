import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reviewer_id' })
  reviewerId: string;

  @Column({ name: 'target_user_id', nullable: true })
  targetUserId: string;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string;

  @Column({ name: 'review_type', type: 'varchar', length: 30, nullable: true })
  reviewType: string; // 'tenant_to_landlord' | 'landlord_to_tenant' | 'property'

  @Column()
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.reviews)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @ManyToOne(() => Property, (p) => p.reviews, { nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
