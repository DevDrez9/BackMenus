import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number) // Asegura que si viene como string "10.50", se convierta a numero
  price: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean; // Por defecto true

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}