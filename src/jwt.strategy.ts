import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secreto_super_seguro', // IMPORTANTE: Usar variable de entorno
    });
  }

  async validate(payload: any) {
    // Esto inyecta el usuario en el request: req.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}