import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Property } from '../entities/property.entity';
import { RentalApplication } from '../entities/rental-application.entity';
import { MarketplaceItem } from '../entities/marketplace-item.entity';
import { Payment } from '../entities/payment.entity';
import { Report } from '../entities/report.entity';
import { Review } from '../entities/review.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Property)
    private propsRepo: Repository<Property>,
    @InjectRepository(RentalApplication)
    private appsRepo: Repository<RentalApplication>,
    @InjectRepository(MarketplaceItem)
    private marketplaceRepo: Repository<MarketplaceItem>,
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectRepository(Report)
    private reportsRepo: Repository<Report>,
    @InjectRepository(Review)
    private reviewsRepo: Repository<Review>,
  ) {}

  // ── Users ──
  async getAllUsers() {
    const users = await this.usersRepo.find({ order: { createdAt: 'DESC' } });
    return users.map(({ passwordHash, ...u }) => u);
  }

  async toggleUserActive(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    await this.usersRepo.save(user);
    const { passwordHash, ...result } = user;
    return result;
  }

  async deleteUser(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.remove(user);
    return { message: 'User deleted' };
  }

  // ── Properties ──
  async getAllProperties() {
    return this.propsRepo.find({
      relations: ['landlord'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteProperty(id: string) {
    const prop = await this.propsRepo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException('Property not found');
    await this.propsRepo.remove(prop);
    return { message: 'Property deleted' };
  }

  // ── Applications ──
  async getAllApplications() {
    return this.appsRepo.find({
      relations: ['property', 'tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  // ── Marketplace ──
  async getAllMarketplaceItems() {
    return this.marketplaceRepo.find({
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteMarketplaceItem(id: string) {
    const item = await this.marketplaceRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    await this.marketplaceRepo.remove(item);
    return { message: 'Item deleted' };
  }

  // ── Payments ──
  async getAllPayments() {
    return this.paymentsRepo.find({
      relations: ['tenant', 'landlord', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  // ── Stats ──
  async getStats() {
    const totalUsers = await this.usersRepo.count();
    const totalProperties = await this.propsRepo.count();
    const totalApplications = await this.appsRepo.count();
    const totalMarketplaceItems = await this.marketplaceRepo.count();
    const totalPayments = await this.paymentsRepo.count();
    const landlords = await this.usersRepo.count({ where: { role: 'landlord' as any } });
    const tenants = await this.usersRepo.count({ where: { role: 'tenant' as any } });
    const availableProperties = await this.propsRepo.count({ where: { isAvailable: true } });

    return {
      totalUsers,
      totalProperties,
      totalApplications,
      totalMarketplaceItems,
      totalPayments,
      landlords,
      tenants,
      availableProperties,
      totalReports: await this.reportsRepo.count(),
      pendingReports: await this.reportsRepo.count({ where: { status: 'pending' } }),
      totalReviews: await this.reviewsRepo.count(),
    };
  }

  // ── Reports ──
  async getAllReports() {
    return this.reportsRepo.find({
      relations: ['reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateReport(id: string, status: string, adminNotes?: string) {
    const report = await this.reportsRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    return this.reportsRepo.save(report);
  }

  // ── Reviews ──
  async getAllReviews() {
    return this.reviewsRepo.find({
      relations: ['reviewer', 'targetUser', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteReview(id: string) {
    const review = await this.reviewsRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewsRepo.remove(review);
    return { message: 'Review deleted' };
  }
}
