import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { CreateReportDto, UpdateReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto) {
    const report = this.reportRepo.create({ ...dto, reporterId });
    return this.reportRepo.save(report);
  }

  async findAll() {
    return this.reportRepo.find({
      relations: ['reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPending() {
    return this.reportRepo.find({
      where: { status: 'pending' },
      relations: ['reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['reporter'],
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async update(id: string, dto: UpdateReportDto) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    Object.assign(report, dto);
    return this.reportRepo.save(report);
  }

  async getMyReports(userId: string) {
    return this.reportRepo.find({
      where: { reporterId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const total = await this.reportRepo.count();
    const pending = await this.reportRepo.count({ where: { status: 'pending' } });
    const reviewed = await this.reportRepo.count({ where: { status: 'reviewed' } });
    const resolved = await this.reportRepo.count({ where: { status: 'resolved' } });
    const dismissed = await this.reportRepo.count({ where: { status: 'dismissed' } });
    return { total, pending, reviewed, resolved, dismissed };
  }
}
