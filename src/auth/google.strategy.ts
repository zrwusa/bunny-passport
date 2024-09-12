// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile as GoogleProfile,
  Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('OAUTH2_GOOGLE_STRATEGY_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    googleAccessToken: string,
    googleRefreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const user = await this.authService.oauthLogin(profile, 'google');
    done(null, user);
  }
}
