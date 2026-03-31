import { IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateMarketplaceItemDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsNotEmpty()
  category: string;

  @IsOptional()
  condition?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}

export class UpdateMarketplaceItemDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  category?: string;

  @IsOptional()
  condition?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  isSold?: boolean;
}
