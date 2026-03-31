import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  type: string; // 'fake_listing' | 'bad_behavior' | 'spam' | 'other'

  @IsString()
  targetType: string; // 'property' | 'marketplace_item' | 'user'

  @IsUUID()
  targetId: string;

  @IsString()
  reason: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  status?: string; // 'reviewed' | 'resolved' | 'dismissed'

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
