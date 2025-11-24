import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Ej: "Menú Principal", "Carta de Vinos"

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // Por defecto true

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  restaurantId: string;
}