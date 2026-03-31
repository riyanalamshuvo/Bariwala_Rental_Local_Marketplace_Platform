import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    // Prevent duplicate reviews
    const whereClause: any = { reviewerId };
    if (dto.propertyId) whereClause.propertyId = dto.propertyId;
    if (dto.targetUserId) whereClause.targetUserId = dto.targetUserId;
    if (dto.reviewType) whereClause.reviewType = dto.reviewType;

    const existing = await this.reviewRepo.findOne({ where: whereClause });
    if (existing) throw new ForbiddenException('You have already submitted a review for this');

    const review = this.reviewRepo.create({ ...dto, reviewerId });
    return this.reviewRepo.save(review);
  }

  async findByProperty(propertyId: string) {
    return this.reviewRepo.find({
      where: { propertyId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(targetUserId: string) {
    return this.reviewRepo.find({
      where: { targetUserId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(targetUserId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avgRating')
      .addSelect('COUNT(r.id)', 'totalReviews')
      .where('r.target_user_id = :uid', { uid: targetUserId })
      .getRawOne();
    return {
      averageRating: result?.avgRating ? parseFloat(parseFloat(result.avgRating).toFixed(1)) : 0,
      totalReviews: parseInt(result?.totalReviews || '0', 10),
    };
  }

  async findAll() {
    return this.reviewRepo.find({
      relations: ['reviewer', 'targetUser', 'property'],
      order: { createdAt: 'DESC' },
    });
  }
}
