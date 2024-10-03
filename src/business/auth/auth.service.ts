// src/auth/auth.controller-response.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/user.entity';
import {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
  PassportProvider,
  ProviderProfile,
  Tokens,
} from '../../types';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { serviceResponseCreator } from '../../common';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    public userService: UserService,
    public jwtService: JwtService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // Generate and store refreshToken
  async generateTokens({ id, email }: User): Promise<Tokens> {
    const payload = {
      email,
      id,
      jti: uuidv4() as string, // jti unique to each token
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
    const rti = uuidv4() as string; // Generate a unique ID for refreshToken
    const refreshToken = this.jwtService.sign(
      { ...payload, rti },
      { expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') },
    );

    // Store refreshToken to Redis
    await this.redisClient.set(
      `refresh_token:${id}:${rti}`, // Use userId and refreshTokenId as keys
      refreshToken,
      'EX',
      7 * 24 * 60 * 60, // Set expiration time, consistent with refreshToken
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // OAuth2 authentication
  async oauthLogin(
    profile: ProviderProfile,
    provider: PassportProvider,
  ): Promise<User> {
    const { id: oauthId, emails } = profile;
    let { data: user } = await this.userService.findOneByOAuthProvider(
      oauthId,
      provider,
    );
    if (!user) {
      const email = emails[0].value;
      // Google profile does not provide a username field and can only be replaced by the email field. Github Profile does not provide a displayName field.
      const username = profile.username || email || profile.displayName;
      const { data } = await this.userService.createOAuthUser(
        { username, email, oauthId },
        provider,
      );
      if (data) user = data;
    }

    return user;
  }

  // Local authenticated user
  async validateUser(email: string, password: string) {
    const { buildFailure, buildSuccess } =
      serviceResponseCreator.createBuilders('validateUser');
    const res = await this.userService.findOneByUsername(email);
    const { data: user } = res;

    if (!user) return buildFailure('USER_OR_PASSWORD_DOES_NOT_MATCH');
    if (!bcrypt.compareSync(password, user.password)) {
      return buildFailure('USER_OR_PASSWORD_DOES_NOT_MATCH');
    }
    return buildSuccess('VALIDATE_USER_SUCCESSFULLY', user);
  }

  // Local login
  async login({ email, password }: LoginDto) {
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('login');
    const res = await this.validateUser(email, password);
    const { success, data: validatedUser, code } = res;
    if (success) {
      const tokens = await this.generateTokens(validatedUser);

      return buildSuccess('LOGIN_SUCCESSFULLY', {
        user: validatedUser,
        tokens,
      });
    }

    switch (code) {
      case 'USER_OR_PASSWORD_DOES_NOT_MATCH':
        return buildFailure('USER_OR_PASSWORD_DOES_NOT_MATCH');
    }

    return buildFailure('LOGIN_FAILED');
  }

  // Refresh Access Token
  async refresh(refreshToken: string) {
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('refresh');
    const { id, email, rti } =
      this.jwtService.decode<JwtRefreshTokenPayload>(refreshToken);
    const storedToken = await this.redisClient.get(
      `refresh_token:${id}:${rti}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      return buildFailure('INVALID_REFRESH_TOKEN');
    }

    // Generate new accessToken
    const newAccessToken = this.jwtService.sign(
      { email, id, jti: uuidv4() as string },
      { expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') },
    );

    return buildSuccess('REFRESH_TOKEN_SUCCESSFULLY', {
      accessToken: newAccessToken,
    });
  }

  async logout(accessToken: string, refreshToken: string) {
    // Decode access token to extract jti and other details
    const decoded = this.jwtService.decode<JwtAccessTokenPayload>(accessToken);
    const jti = decoded['jti']; // Extract jti from the token payload

    if (jti) {
      // Optionally blacklist the access token
      const expiresIn = decoded['exp'] - Math.floor(Date.now() / 1000);
      await this.blacklistToken(jti, expiresIn);
    }

    // Decode refresh token to get its ID
    const refreshTokenDecoded =
      this.jwtService.decode<JwtRefreshTokenPayload>(refreshToken);
    const refreshTokenId = refreshTokenDecoded.rti;

    if (refreshTokenId) {
      // Delete the refresh token from Redis using userId and rti
      await this.deleteRefreshToken(decoded.id, refreshTokenId);
    }
  }

  // Delete refreshToken
  async deleteRefreshToken(userId: string, rti: string) {
    await this.redisClient.del(`refresh_token:${userId}:${rti}`);
  }

  // Add accessToken to blacklist
  async blacklistToken(jti: string, expiresIn: number) {
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('redisSet');
    // TODO blacklist token key design
    const redisRes = await this.redisClient.set(
      `blacklist_token:${jti}`,
      'true',
      'EX',
      expiresIn,
    );

    if (redisRes !== 'OK') return buildSuccess('NOT_OK');
    return buildFailure('OK');
  }

  // Check if the token is in the blacklist
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist_token:${jti}`);
    return result === 'true';
  }

  async validateToken(token: string) {
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders([
        'validateToken',
        'validateJwtPayload',
      ]);
    try {
      const JWT_SECRET = this.configService.get('JWT_SECRET');
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });

      if (!payload) {
        return buildFailure('MALFORMED_TOKEN');
      }

      return buildSuccess('VALIDATED_SUCCESSFULLY', payload);
    } catch (error: any) {
      console.log(error.message);
      return buildFailure('TOKEN_VALIDATION_FAILED');
    }
  }

  async validateJwtPayload({ jti }: JwtAccessTokenPayload) {
    const isBlacklisted = await this.isBlacklisted(jti);
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('validateJwtPayload');
    if (isBlacklisted) {
      return buildFailure('BLACKLISTED');
    }

    return buildSuccess('VALIDATED_SUCCESSFULLY', isBlacklisted);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.userRepository.findOneBy({ id });
    const { buildSuccess, buildFailure } =
      serviceResponseCreator.createBuilders('changePassword');
    if (!user) {
      return buildFailure('USER_NOT_FOUND');
    }

    const { email, password, oldPassword } = changePasswordDto;

    if (
      user.password !== null &&
      !(await this.userService.comparePasswords(oldPassword, user.password))
    ) {
      return buildFailure('ORIGINAL_PASSWORD_IS_INCORRECT');
    }

    user.password = await bcrypt.hash(password, 10);

    await this.userService.sendEmailVerificationLink(email);
    const savedUser = await this.userService.userRepository.save(user);
    return buildSuccess('PASSWORD_CHANGED_SUCCESSFULLY', savedUser);
  }
}
