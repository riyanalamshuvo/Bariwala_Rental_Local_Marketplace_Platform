import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { RentalApplication } from '../entities/rental-application.entity';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propsRepo: Repository<Property>,
    @InjectRepository(RentalApplication)
    private appsRepo: Repository<RentalApplication>,
  ) {}

  async findAll(query: { search?: string; city?: string; type?: string; minRent?: number; maxRent?: number }) {
    const qb = this.propsRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.landlord', 'landlord')
      .where('p.is_available = :avail', { avail: true });

    // Full-text search across title, address, city, description
    if (query.search) {
      qb.andWhere(
        '(LOWER(p.title) LIKE LOWER(:search) OR LOWER(p.address) LIKE LOWER(:search) OR LOWER(p.city) LIKE LOWER(:search) OR LOWER(p.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }
    if (query.city) qb.andWhere('LOWER(p.city) = LOWER(:city)', { city: query.city });
    if (query.type) qb.andWhere('p.property_type = :type', { type: query.type });
    if (query.minRent) qb.andWhere('p.rent_amount >= :min', { min: query.minRent });
    if (query.maxRent) qb.andWhere('p.rent_amount <= :max', { max: query.maxRent });

    qb.orderBy('p.created_at', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const prop = await this.propsRepo.findOne({
      where: { id },
      relations: ['landlord', 'reviews', 'reviews.reviewer'],
    });
    if (!prop) throw new NotFoundException('Property not found');
    return prop;
  }

  async findByLandlord(landlordId: string) {
    return this.propsRepo.find({
      where: { landlordId },
      relations: ['applications', 'applications.tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(landlordId: string, dto: CreatePropertyDto) {
    const prop = this.propsRepo.create({ ...dto, landlordId });
    return this.propsRepo.save(prop);
  }

  async update(id: string, userId: string, dto: UpdatePropertyDto) {
    const prop = await this.propsRepo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException();
    if (prop.landlordId !== userId) throw new ForbiddenException();
    Object.assign(prop, dto);
    return this.propsRepo.save(prop);
  }

  async remove(id: string, userId: string) {
    const prop = await this.propsRepo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException();
    if (prop.landlordId !== userId) throw new ForbiddenException();
    await this.propsRepo.remove(prop);
    return { message: 'Deleted' };
  }

  // --- Rental Applications ---
  async applyForRental(propertyId: string, tenantId: string, message?: string) {
    const prop = await this.propsRepo.findOne({ where: { id: propertyId } });
    if (!prop) throw new NotFoundException('Property not found');

    const existing = await this.appsRepo.findOne({
      where: { propertyId, tenantId },
    });
    if (existing) throw new ForbiddenException('Already applied');

    const app = this.appsRepo.create({ propertyId, tenantId, message });
    return this.appsRepo.save(app);
  }

  async getApplications(propertyId: string, landlordId: string) {
    const prop = await this.propsRepo.findOne({ where: { id: propertyId } });
    if (!prop) throw new NotFoundException();
    if (prop.landlordId !== landlordId) throw new ForbiddenException();

    return this.appsRepo.find({
      where: { propertyId },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateApplicationStatus(appId: string, landlordId: string, status: string) {
    const app = await this.appsRepo.findOne({
      where: { id: appId },
      relations: ['property'],
    });
    if (!app) throw new NotFoundException();
    if (app.property.landlordId !== landlordId) throw new ForbiddenException();

    app.status = status;
    return this.appsRepo.save(app);
  }

  async getMyApplications(tenantId: string) {
    return this.appsRepo.find({
      where: { tenantId },
      relations: ['property', 'property.landlord'],
      order: { createdAt: 'DESC' },
    });
  }
}
