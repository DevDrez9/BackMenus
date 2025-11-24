import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

// Repetimos el enum o lo importamos de Prisma si generaste el cliente
enum Role {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  CLIENT = 'CLIENT',
}

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}