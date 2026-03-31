import {
  Controller, Get, Post, Put, Delete, Param, Body,
  Query, UseGuards, Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, ApplyRentalDto } from './dto/property.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private svc: PropertiesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('type') type?: string,
    @Query('minRent') minRent?: number,
    @Query('maxRent') maxRent?: number,
  ) {
    return this.svc.findAll({ search, city, type, minRent, maxRent });
  }

  // Static routes MUST be defined before :id to avoid NestJS matching "my" as an id
  @UseGuards(JwtAuthGuard)
  @Get('my/listings')
  myListings(@Request() req: any) {
    return this.svc.findByLandlord(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/applications')
  myApplications(@Request() req: any) {
    return this.svc.getMyApplications(req.user.id);
  }

  // Static PUT route must be before :id to avoid matching "applications" as an id
  @UseGuards(JwtAuthGuard)
  @Put('applications/:appId/status')
  updateAppStatus(
    @Param('appId') appId: string,
    @Request() req: any,
    @Body('status') status: string,
  ) {
    return this.svc.updateApplicationStatus(appId, req.user.id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreatePropertyDto) {
    return this.svc.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdatePropertyDto) {
    return this.svc.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.svc.remove(id, req.user.id);
  }

  // --- Rental Applications ---
  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  apply(@Param('id') id: string, @Request() req: any, @Body() dto: ApplyRentalDto) {
    return this.svc.applyForRental(id, req.user.id, dto.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applications')
  getApplications(@Param('id') id: string, @Request() req: any) {
    return this.svc.getApplications(id, req.user.id);
  }
}
