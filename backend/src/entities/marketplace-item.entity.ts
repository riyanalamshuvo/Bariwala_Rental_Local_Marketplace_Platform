import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('marketplace_items')
export class MarketplaceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seller_id' })
  sellerId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column()
  category: string;

  @Column({ default: 'used' })
  condition: string;

  @Column('text', { array: true, name: 'image_urls', nullable: true })
  imageUrls: string[];

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'is_sold', default: false })
  isSold: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.marketplaceItems)
  @JoinColumn({ name: 'seller_id' })
  seller: User;
}
