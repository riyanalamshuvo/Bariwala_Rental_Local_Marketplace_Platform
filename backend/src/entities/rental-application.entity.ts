import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@Entity('rental_applications')
export class RentalApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id' })
  propertyId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ default: 'pending' })
  status: string; // pending | approved | rejected

  @Column({ type: 'text', nullable: true })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Property, (p) => p.applications)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => User, (u) => u.rentalApplications)
  @JoinColumn({ name: 'tenant_id' })
  tenant: User;
}
