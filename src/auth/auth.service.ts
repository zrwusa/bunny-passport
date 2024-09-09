// src/auth/auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    public jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // 生成和存储 refresh_token
  private async generateTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      jti: uuidv4(), // 每个 token 独有的 jti
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshTokenId = uuidv4(); // 生成 refresh_token 的唯一 ID
    const refreshToken = this.jwtService.sign(
      { ...payload, rti: refreshTokenId },
      { expiresIn: '7d' },
    );

    // 存储 refresh_token 到 Redis
    await this.redisClient.set(
      `refresh_token:${user.id}:${refreshTokenId}`, // 使用 userId 和 refreshTokenId 作为 key
      refreshToken,
      'EX',
      7 * 24 * 60 * 60, // 设置过期时间，与 refresh_token 一致
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 统一登录处理方法
  private async loginWithValidatedUser(user: any) {
    return this.generateTokens(user); // 统一调用生成 tokens
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
    return this.loginWithValidatedUser(user); // 统一调用登录方法
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
    return this.loginWithValidatedUser(validatedUser); // 统一调用登录方法
  }

  // Refresh Access Token
  async refresh(user: any, refreshToken: string) {
    const { rti } = this.jwtService.decode(refreshToken) as { rti: string };
    const storedToken = await this.redisClient.get(
      `refresh_token:${user.id}:${rti}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    // 生成新的 access_token
    const newAccessToken = this.jwtService.sign(
      { email: user.email, sub: user.id, jti: uuidv4() },
      { expiresIn: '15m' },
    );

    return { access_token: newAccessToken };
  }

  // 删除 refresh_token
  async deleteRefreshToken(userId: string, refreshTokenId: string) {
    await this.redisClient.del(`refresh_token:${userId}:${refreshTokenId}`);
  }

  // 添加 access_token 到黑名单
  async blacklistToken(jti: string, expiresIn: number) {
    await this.redisClient.set(
      `blacklist_token:${jti}`,
      'true',
      'EX',
      expiresIn,
    );
  }

  // 检查 token 是否在黑名单中
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.redisClient.get(`blacklist_token:${jti}`);
    return result === 'true';
  }
}
