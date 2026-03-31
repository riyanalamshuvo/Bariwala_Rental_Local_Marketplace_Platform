import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Property } from '../entities/property.entity';
import { RentalApplication } from '../entities/rental-application.entity';
import { MarketplaceItem } from '../entities/marketplace-item.entity';
import { Payment } from '../entities/payment.entity';
import { Report } from '../entities/report.entity';
import { Review } from '../entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Property, RentalApplication, MarketplaceItem, Payment, Report, Review]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
