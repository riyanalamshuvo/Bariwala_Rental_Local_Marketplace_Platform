import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private svc: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Get('property/:propertyId')
  byProperty(@Param('propertyId') propertyId: string) {
    return this.svc.findByProperty(propertyId);
  }

  @Get('user/:userId')
  byUser(@Param('userId') userId: string) {
    return this.svc.findByUser(userId);
  }

  @Get('user/:userId/average')
  avgRating(@Param('userId') userId: string) {
    return this.svc.getAverageRating(userId);
  }
}
