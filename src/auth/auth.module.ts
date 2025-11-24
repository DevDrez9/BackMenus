import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // Ajusta la ruta si es necesario
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/jwt.strategy';


@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      global: true, // Hace que el JwtService esté disponible en toda la app
      secret: process.env.JWT_SECRET || 'secreto_super_seguro', // Mover a .env
      signOptions: { expiresIn: '1d' }, // El token expira en 1 día
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}