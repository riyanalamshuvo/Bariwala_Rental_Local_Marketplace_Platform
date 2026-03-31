import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private payRepo: Repository<Payment>,
  ) {}

  async create(tenantId: string, dto: CreatePaymentDto) {
    const payment = this.payRepo.create({
      tenantId,
      landlordId: dto.landlordId,
      propertyId: dto.propertyId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod || 'bank_transfer',
      monthPeriod: dto.monthPeriod || '',
      transactionId: 'TXN-' + uuidv4().substring(0, 8).toUpperCase(),
    });
    return this.payRepo.save(payment);
  }

  async simulateComplete(paymentId: string, userId: string) {
    const payment = await this.payRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException();

    payment.status = 'completed';
    payment.paidAt = new Date();
    return this.payRepo.save(payment);
  }

  async getInvoice(paymentId: string) {
    const payment = await this.payRepo.findOne({
      where: { id: paymentId },
      relations: ['property', 'tenant', 'landlord'],
    });
    if (!payment) throw new NotFoundException('Payment not found');

    return {
      invoiceId: 'INV-' + payment.transactionId?.replace('TXN-', ''),
      transactionId: payment.transactionId,
      tenant: { id: payment.tenant?.id, name: payment.tenant?.fullName, email: payment.tenant?.email },
      landlord: { id: payment.landlord?.id, name: payment.landlord?.fullName, email: payment.landlord?.email },
      property: { id: payment.property?.id, title: payment.property?.title, address: payment.property?.address },
      amount: payment.amount,
      monthPeriod: payment.monthPeriod,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    };
  }

  async getMyPayments(userId: string, role: string) {
    const where = role === 'tenant' ? { tenantId: userId } : { landlordId: userId };
    return this.payRepo.find({
      where,
      relations: ['property', 'tenant', 'landlord'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(id: string) {
    const payment = await this.payRepo.findOne({
      where: { id },
      relations: ['property', 'tenant', 'landlord'],
    });
    if (!payment) throw new NotFoundException();
    return payment;
  }
}
