import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as GithubProfile } from 'passport-github2';
import { User } from '../../user/user.entity';

export type JwtTokenPayload = {
  email: string;
  id: string;
  iat: number;
  exp: number;
};

export type JwtAccessTokenPayload = JwtTokenPayload & {
  jti: string;
};

export type JwtRefreshTokenPayload = JwtTokenPayload & {
  rti: string;
};

export type ProviderProfile = GoogleProfile | GithubProfile;

export type CreateOAuthUserProfile = {
  username: string;
  email: string;
  oauthId: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type SafeUser = Omit<User, 'password' | 'createdAt' | 'updatedAt'>;

export type JwtReqUser = { id: string; email: string };

export type PassportProvider = 'google' | 'github' | 'facebook';