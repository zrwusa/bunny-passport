// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtAccessTokenPayload, JwtReqUser } from '../types';

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

  // If jwt-guard finds that the request carries an access token, it will trigger this. If there is no jwt-guard, it will directly return a verification error message.
  async validate({
    jti,
    id,
    email,
  }: JwtAccessTokenPayload): Promise<JwtReqUser> {
    // const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    // Check if the JWT's unique identifier (jti) is in the blacklist
    const isBlacklisted = await this.authService.isBlacklisted(jti);
    if (isBlacklisted) {
      throw new UnauthorizedException(
        'Token has been blacklisted, that means you have logged out',
      );
    }

    // The data returned from here will be bound to req.user
    return { id, email };
  }
}
