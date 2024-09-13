// src/auth/auth.helpers.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { omit } from '../utils';
import { User } from '../user/user.entity';
import {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
  PassportProvider,
  ProviderProfile,
  SafeUser,
  Tokens,
} from '../types';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { validate } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { ServiceResponse } from '../interfaces';
import { serviceProtocolResFactory } from '../common';

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
    let user = await this.userService.findOneByOAuthProvider(oauthId, provider);
    if (!user) {
      const email = emails[0].value;
      // Google profile does not provide a username field and can only be replaced by the email field. Github Profile does not provide a displayName field.
      const username = profile.username || email || profile.displayName;
      user = await this.userService.createOAuthUser(
        { username, email, oauthId },
        provider,
      );
    }

    return user;
  }

  // Local authenticated user
  async validateUser(
    email: string,
    password: string,
  ): Promise<ServiceResponse<User>> {
    const { createFailedRes, createSuccessRes } =
      serviceProtocolResFactory('validateUser');
    const res = await this.userService.findOneByUsername(email);
    const { data: user } = res;

    if (!user) return createFailedRes('USER_OR_PASSWORD_DOES_NOT_MATCH');
    if (bcrypt.compareSync(password, user.password)) {
      return createSuccessRes('VALIDATE_USER_SUCCESSFULLY', user);
    }
  }

  // Local login
  async login({
    email,
    password,
  }: LoginDto): Promise<ServiceResponse<{ user: SafeUser; tokens: Tokens }>> {
    const { createSuccessRes } = serviceProtocolResFactory('login');
    const res = await this.validateUser(email, password);
    const { data: validatedUser } = res;
    const tokens = await this.generateTokens(validatedUser);
    const safeUser = omit(validatedUser, 'password', 'createdAt', 'updatedAt');
    return createSuccessRes('LOGIN_SUCCESSFULLY', {
      user: safeUser,
      tokens,
    });
  }

  // Refresh Access Token
  async refresh(refreshToken: string) {
    const { id, email, rti } =
      this.jwtService.decode<JwtRefreshTokenPayload>(refreshToken);
    const storedToken = await this.redisClient.get(
      `refresh_token:${id}:${rti}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // Generate new accessToken
    const newAccessToken = this.jwtService.sign(
      { email, id, jti: uuidv4() as string },
      { expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') },
    );

    return { accessToken: newAccessToken };
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
    // TODO blacklist token key design
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
      // TODO http errors should be thrown?
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
