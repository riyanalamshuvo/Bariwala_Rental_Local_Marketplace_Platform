import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'landlord_id' })
  landlordId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ name: 'rent_amount', type: 'decimal', precision: 12, scale: 2 })
  rentAmount: number;

  @Column({ default: 1 })
  bedrooms: number;

  @Column({ default: 1 })
  bathrooms: number;

  @Column({ name: 'area_sqft', nullable: true })
  areaSqft: number;

  @Column({ name: 'property_type', default: 'flat' })
  propertyType: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column('text', { array: true, name: 'image_urls', nullable: true })
  imageUrls: string[];

  @Column({ name: 'advance_deposit', type: 'decimal', precision: 12, scale: 2, nullable: true })
  advanceDeposit: number;

  @Column({ name: 'map_latitude', type: 'double precision', nullable: true })
  mapLatitude: number;

  @Column({ name: 'map_longitude', type: 'double precision', nullable: true })
  mapLongitude: number;

  @Column({ name: 'distance_from_road', nullable: true })
  distanceFromRoad: string;

  @Column('text', { array: true, nullable: true })
  facilities: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne('User', 'properties')
  @JoinColumn({ name: 'landlord_id' })
  landlord: any;

  @OneToMany('RentalApplication', 'property')
  applications: any[];

  @OneToMany('Payment', 'property')
  payments: any[];

  @OneToMany('Message', 'property')
  messages: any[];

  @OneToMany('Review', 'property')
  reviews: any[];
}
