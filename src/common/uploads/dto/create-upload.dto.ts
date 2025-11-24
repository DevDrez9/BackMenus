import { IsEnum, IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export enum UploadType {
  RESTAURANT = 'RESTAURANT',
  PRODUCT = 'PRODUCT',
}

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  // Validación simple para asegurar que parece un base64 de imagen
  @Matches(/^data:image\/(png|jpg|jpeg|webp);base64,/, {
    message: 'El archivo debe ser una imagen válida en formato Base64 (png, jpg, jpeg, webp)',
  })
  file: string;

  @IsEnum(UploadType)
  @IsNotEmpty()
  type: UploadType;

  @IsUUID()
  @IsNotEmpty()
  entityId: string; // ID del Restaurante o del Producto
}