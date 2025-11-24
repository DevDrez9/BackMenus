import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string; // Ej: "Entradas", "Postres"

  @IsInt()
  @IsOptional()
  order?: number; // Para que el usuario decida el orden visual (1, 2, 3...)

  @IsUUID()
  @IsNotEmpty()
  menuId: string;
}