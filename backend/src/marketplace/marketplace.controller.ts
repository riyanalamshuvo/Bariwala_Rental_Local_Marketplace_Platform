import {
  Controller, Get, Post, Put, Delete, Param, Body,
  Query, UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';
import { CreateMarketplaceItemDto, UpdateMarketplaceItemDto } from './dto/marketplace.dto';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private svc: MarketplaceService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('condition') condition?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.svc.findAll({ search, category, condition, city, minPrice, maxPrice });
  }

  // Static routes MUST be defined before :id to avoid NestJS matching "my" as an id
  @UseGuards(JwtAuthGuard)
  @Get('my/items')
  myItems(@Request() req: any) {
    return this.svc.findBySeller(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreateMarketplaceItemDto) {
    return this.svc.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateMarketplaceItemDto) {
    return this.svc.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.svc.remove(id, req.user.id);
  }
}
