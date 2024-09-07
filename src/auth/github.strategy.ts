import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: `http://localhost:${configService.get('PORT')}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (...args: any[]) => void,
  ): Promise<any> {
    const { id, username, emails, photos } = profile;
    const user = {
      githubId: id,
      username,
      email: emails?.[0]?.value,
      picture: photos?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
