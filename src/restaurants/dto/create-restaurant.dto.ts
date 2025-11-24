import { IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // Transformamos a número por si viene como string "12.345"
  @IsNumber()
  @IsOptional()
  @Type(() => Number) 
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

   @IsString()
  @IsOptional()
  theme?: string; // <--- AGREGAR ESTO
  
  // El slug lo generamos en el backend, no lo pedimos aquí necesariamente
}