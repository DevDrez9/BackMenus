import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateSectionTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string; // El plan mínimo requerido
}