import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

// Definimos el enum aquí o lo importamos de @prisma/client si generaste el cliente
enum Role {
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
  // No permitimos registrar ADMINS públicamente por seguridad
}

export class RegisterAuthDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Por defecto será OWNER según el Schema, pero dejamos opción
}