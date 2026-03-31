import { Controller, Post, Get, Param, Body, UseGuards, Request, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreatePaymentDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string, @Request() req: any) {
    return this.svc.simulateComplete(id, req.user.id);
  }

  @Get()
  myPayments(@Request() req: any) {
    return this.svc.getMyPayments(req.user.id, req.user.role);
  }

  @Get(':id/invoice')
  getInvoice(@Param('id') id: string) {
    return this.svc.getInvoice(id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.svc.getPaymentById(id);
  }
}
