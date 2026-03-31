import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'landlord_id' })
  landlordId: string;

  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', default: 'bank_transfer' })
  paymentMethod: string;

  @Column({ name: 'month_period', nullable: true })
  monthPeriod: string; // e.g. "January 2025", "Feb 2025"

  @Column({ default: 'pending' })
  status: string; // pending | completed | failed

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.tenantPayments)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;

  @ManyToOne(() => User, (u) => u.landlordPayments)
  @JoinColumn({ name: 'landlord_id' })
  landlord: User;

  @ManyToOne(() => Property, (p) => p.payments)
  @JoinColumn({ name: 'property_id' })
  property: Property;
}
