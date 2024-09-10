// src/auth/auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { omit } from '../utils';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    public jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // Generate and store refresh_token
  async generateTokens(user: any) {
    const payload = {
      email: user.email,
      id: user.id,
      jti: uuidv4(), // jti unique to each token
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshTokenId = uuidv4(); // Generate a unique ID for refresh_token
    const refreshToken = this.jwtService.sign(
      { ...payload, rti: refreshTokenId },
      { expiresIn: '7d' },
    );

    // 存储 refresh_token 到 Redis
    await this.redisClient.set(
      `refresh_token:${user.id}:${refreshTokenId}`, // Use userId and refreshTokenId as keys
      refreshToken,
      'EX',
      7 * 24 * 60 * 60, // Set expiration time, consistent with refresh_token
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // OAuth2 authentication
  async oauthLogin(profile: any, provider: string): Promise<any> {
    let user = await this.userService.findOneByOAuthProvider(
      profile.id,
      provider,
    );
    if (!user) {
      const { displayName: username, id: oauthid, emails } = profile;
      const email = emails[0].value;
      user = await this.userService.createOAuthUser(
        { username, email, oauthid },
        provider,
      );
    }

    return user;
  }

  // Local authenticated user
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByUsername(email);
    if (!user)
      throw new UnauthorizedException('user or password does not exist');
    if (bcrypt.compareSync(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('user or password does not exist');
  }

  // Local login
  async login(user: any) {
    const validatedUser = await this.validateUser(user.email, user.password);
    const tokens = await this.generateTokens(validatedUser); // 统一调用登录方法
    const safeUser = omit(validatedUser, 'password', 'createdAt', 'updatedAt');
    return { user: safeUser, tokens };
  }

  // Refresh Access Token
  async refresh(refreshToken: string) {
    const decoded = this.jwtService.decode(refreshToken);
    const { rti } = decoded;
    const storedToken = await this.redisClient.get(
      `refresh_token:${decoded.id}:${rti}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // Generate new access_token
    const newAccessToken = this.jwtService.sign(
      { email: decoded.email, id: decoded.id, jti: uuidv4() },
      { expiresIn: '15m' },
    );

    return { access_token: newAccessToken };
  }

  // Delete refresh_token
  async deleteRefreshToken(userId: string, refreshTokenId: string) {
    await this.redisClient.del(`refresh_token:${userId}:${refreshTokenId}`);
  }

  // Add access_token to blacklist
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
}
