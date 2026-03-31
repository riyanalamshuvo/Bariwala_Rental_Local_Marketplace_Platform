import { IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, IsString } from 'class-validator';

export class CreatePropertyDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  city: string;

  @IsNumber()
  rentAmount: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  areaSqft?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  advanceDeposit?: number;

  @IsOptional()
  @IsNumber()
  mapLatitude?: number;

  @IsOptional()
  @IsNumber()
  mapLongitude?: number;

  @IsOptional()
  @IsString()
  distanceFromRoad?: string;

  @IsOptional()
  @IsArray()
  facilities?: string[];
}

export class UpdatePropertyDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  @IsNumber()
  rentAmount?: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  areaSqft?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  advanceDeposit?: number;

  @IsOptional()
  @IsNumber()
  mapLatitude?: number;

  @IsOptional()
  @IsNumber()
  mapLongitude?: number;

  @IsOptional()
  @IsString()
  distanceFromRoad?: string;

  @IsOptional()
  @IsArray()
  facilities?: string[];
}

export class ApplyRentalDto {
  @IsOptional()
  message?: string;
}
