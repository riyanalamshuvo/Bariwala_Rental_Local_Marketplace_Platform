import { Controller, Get, Delete, Put, Param, Body, UseGuards, } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private svc: AdminService) {}

  // ── Stats ──
  @Get('stats')
  getStats() {
    return this.svc.getStats();
  }

  // ── Users ──
  @Get('users')
  getAllUsers() {
    return this.svc.getAllUsers();
  }

  @Put('users/:id/toggle')
  toggleUserActive(@Param('id') id: string) {
    return this.svc.toggleUserActive(id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.svc.deleteUser(id);
  }

  // ── Properties ──
  @Get('properties')
  getAllProperties() {
    return this.svc.getAllProperties();
  }

  @Delete('properties/:id')
  deleteProperty(@Param('id') id: string) {
    return this.svc.deleteProperty(id);
  }

  // ── Applications ──
  @Get('applications')
  getAllApplications() {
    return this.svc.getAllApplications();
  }

  // ── Marketplace ──
  @Get('marketplace')
  getAllMarketplaceItems() {
    return this.svc.getAllMarketplaceItems();
  }

  @Delete('marketplace/:id')
  deleteMarketplaceItem(@Param('id') id: string) {
    return this.svc.deleteMarketplaceItem(id);
  }

  // ── Payments ──
  @Get('payments')
  getAllPayments() {
    return this.svc.getAllPayments();
  }

  // ── Reports ──
  @Get('reports')
  getAllReports() {
    return this.svc.getAllReports();
  }

  @Put('reports/:id')
  updateReport(
    @Param('id') id: string,
    @Body() body: { status: string; adminNotes?: string },
  ) {
    return this.svc.updateReport(id, body.status, body.adminNotes);
  }

  // ── Reviews ──
  @Get('reviews')
  getAllReviews() {
    return this.svc.getAllReviews();
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string) {
    return this.svc.deleteReview(id);
  }
}
