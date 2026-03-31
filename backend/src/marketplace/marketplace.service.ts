import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceItem } from '../entities/marketplace-item.entity';
import { CreateMarketplaceItemDto, UpdateMarketplaceItemDto } from './dto/marketplace.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceItem)
    private itemRepo: Repository<MarketplaceItem>,
  ) {}

  async findAll(query: { search?: string; category?: string; condition?: string; city?: string; minPrice?: number; maxPrice?: number }) {
    const qb = this.itemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.seller', 'seller')
      .where('item.is_sold = :sold', { sold: false });

    if (query.search) {
      qb.andWhere(
        '(LOWER(item.title) LIKE LOWER(:search) OR LOWER(item.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }
    if (query.category) qb.andWhere('item.category = :cat', { cat: query.category });
    if (query.condition) qb.andWhere('item.condition = :cond', { cond: query.condition });
    if (query.city) qb.andWhere('LOWER(item.city) = LOWER(:city)', { city: query.city });
    if (query.minPrice) qb.andWhere('item.price >= :min', { min: query.minPrice });
    if (query.maxPrice) qb.andWhere('item.price <= :max', { max: query.maxPrice });

    qb.orderBy('item.created_at', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!item) throw new NotFoundException();
    return item;
  }

  async findBySeller(sellerId: string) {
    return this.itemRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(sellerId: string, dto: CreateMarketplaceItemDto) {
    const item = this.itemRepo.create({ ...dto, sellerId });
    return this.itemRepo.save(item);
  }

  async update(id: string, userId: string, dto: UpdateMarketplaceItemDto) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    if (item.sellerId !== userId) throw new ForbiddenException();
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(id: string, userId: string) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException();
    if (item.sellerId !== userId) throw new ForbiddenException();
    await this.itemRepo.remove(item);
    return { message: 'Deleted' };
  }
}
