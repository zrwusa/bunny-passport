// src/auth/auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { omit } from '../utils';
import { User } from '../user/user.entity';
import {
  JwtRefreshTokenPayload,
  PassportProvider,
  ProviderProfile,
  SafeUser,
  Tokens,
} from '../types';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { validate } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    public userService: UserService,
    public jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // Generate and store refreshToken
  async generateTokens({ id, email }: User): Promise<Tokens> {
    const payload = {
      email,
      id,
      jti: uuidv4() as string, // jti unique to each token
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const rti = uuidv4() as string; // Generate a unique ID for refreshToken
    const refreshToken = this.jwtService.sign(
      { ...payload, rti },
      { expiresIn: '7d' },
    );

    // 存储 refreshToken 到 Redis
    await this.redisClient.set(
      `refreshToken:${id}:${rti}`, // Use userId and refreshTokenId as keys
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
    const { id: oauthId, displayName: username, emails } = profile;
    let user = await this.userService.findOneByOAuthProvider(oauthId, provider);
    if (!user) {
      const email = emails[0].value;
      user = await this.userService.createOAuthUser(
        { username, email, oauthId },
        provider,
      );
    }

    return user;
  }

  // Local authenticated user
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByUsername(email);
    if (!user)
      throw new UnauthorizedException('user or password does not match');
    if (bcrypt.compareSync(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('user or password does not match');
  }

  // Local login
  async login({
    email,
    password,
  }: LoginDto): Promise<{ user: SafeUser; tokens: Tokens }> {
    const validatedUser = await this.validateUser(email, password);
    const tokens = await this.generateTokens(validatedUser); // 统一调用登录方法
    const safeUser = omit(validatedUser, 'password', 'createdAt', 'updatedAt');
    return { user: safeUser, tokens };
  }

  // Refresh Access Token
  async refresh(refreshToken: string) {
    const { id, email, rti } =
      this.jwtService.decode<JwtRefreshTokenPayload>(refreshToken);
    const storedToken = await this.redisClient.get(`refreshToken:${id}:${rti}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // Generate new accessToken
    const newAccessToken = this.jwtService.sign(
      { email, id, jti: uuidv4() as string },
      { expiresIn: '15m' },
    );

    return { accessToken: newAccessToken };
  }

  // Delete refreshToken
  async deleteRefreshToken(userId: string, rti: string) {
    await this.redisClient.del(`refreshToken:${userId}:${rti}`);
  }

  // Add accessToken to blacklist
  async blacklistToken(jti: string, expiresIn: number) {
    await this.redisClient.set(
      `blacklist_token:${jti}`,
      'true',
      'EX',
      expiresIn,
    );
  }

  // Check if the token is in the blacklist
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist_token:${jti}`);
    return result === 'true';
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const errors = await validate(changePasswordDto);
    if (errors.length > 0) {
      return 'Validation failed';
    }

    const user = await this.userService.userRepository.findOneBy({ id });
    if (!user) {
      return 'User not found';
    }

    const { email, password, oldPassword } = changePasswordDto;

    if (!password) return 'Password is required';

    if (!oldPassword) {
      return 'Original password is required';
    }

    if (
      user.password !== null &&
      !(await this.userService.comparePasswords(oldPassword, user.password))
    ) {
      return 'Original password is incorrect';
    }

    user.password = await bcrypt.hash(password, 10);

    await this.userService.sendEmailVerificationLink(email);
    await this.userService.userRepository.save(user);
    return 'Password changed successfully';
  }
}
