import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  landlordId: string;

  @IsUUID()
  propertyId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  monthPeriod?: string; // e.g. "January 2025"
}
