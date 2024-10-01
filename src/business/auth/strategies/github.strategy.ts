// src/auth/github.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile as GithubProfile, Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { VerifyCallback } from 'passport';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('OAUTH2_GITHUB_STRATEGY_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    githubAccessToken: string,
    githubRefreshToken: string,
    profile: GithubProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const user = await this.authService.oauthLogin(profile, 'github');
    done(null, user);
  }
}
