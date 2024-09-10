// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      // passReqToCallback: true,
    });
  }

  // Verify JWT and check if it is in blacklist
  async validate(payload: any) {
    // const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    // Check if the JWT's unique identifier (jti) is in the blacklist
    const isBlacklisted = await this.authService.isBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException(
        'Token has been blacklisted, that means you have logged out',
      );
    }

    // Returns the authenticated user object.ts
    return { userId: payload.id, email: payload.email };
  }
}
