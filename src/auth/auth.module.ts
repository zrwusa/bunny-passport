// src/auth/auth.module.ts
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Module } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubStrategy } from './github.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_SIGN_EXPIRES_IN') },
      }),
    }),
    PassportModule,
    RedisModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    AuthService,
    GoogleStrategy,
    GitHubStrategy,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
