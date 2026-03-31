import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  receiverId: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;
}
