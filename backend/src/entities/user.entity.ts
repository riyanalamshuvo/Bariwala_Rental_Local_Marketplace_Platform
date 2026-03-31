import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';

export enum UserRole {
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  BUYER_SELLER = 'buyer_seller',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20 })
  role: UserRole;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany('Property', 'landlord')
  properties: any[];

  @OneToMany('Message', 'sender')
  sentMessages: any[];

  @OneToMany('Message', 'receiver')
  receivedMessages: any[];

  @OneToMany('Payment', 'tenant')
  tenantPayments: any[];

  @OneToMany('Payment', 'landlord')
  landlordPayments: any[];

  @OneToMany('MarketplaceItem', 'seller')
  marketplaceItems: any[];

  @OneToMany('RentalApplication', 'tenant')
  rentalApplications: any[];

  @OneToMany('Review', 'reviewer')
  reviews: any[];
}
