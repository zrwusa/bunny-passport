// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtAccessTokenPayload, JwtReqUser } from '../../../types';

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
  async validate(payload: JwtAccessTokenPayload): Promise<JwtReqUser> {
    const { success, code } =
      await this.authService.validateJwtPayload(payload);
    if (!success) {
      throw new UnauthorizedException(code);
    }
    const { id, email } = payload;
    // The data returned from here will be bound to req.user
    return { id, email };
  }
}
