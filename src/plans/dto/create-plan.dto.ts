import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsBoolean()
  @IsOptional()
  hasSections?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAnalytics?: boolean;

  @IsInt()
  @Min(0)
  maxHighlightImages: number; // Obligatorio: Límite de banner

  @IsInt()
  @Min(0)
  @IsOptional()
  maxProductImages?: number; // Opcional: Si es null, es ilimitado

  @IsInt()
  @Min(1)
  @IsOptional()
  maxProducts?: number; // Límite total de platos (texto)
}