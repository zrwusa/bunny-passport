// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: LoginDto) {
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleLoginCallback(@Request() req) {
    const tokens = await this.authService.generateTokens(req.user);
    return {
      url: `/success?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    };
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Redirect to Github
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @Redirect()
  async githubLoginCallback(@Request() req) {
    const tokens = await this.authService.generateTokens(req.user);
    return {
      url: `/success?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    };
  }

  @Post('refresh')
  async refreshToken(@Request() req, @Body() body: RefreshTokenDto) {
    const { refresh_token } = body;
    return this.authService.refresh(refresh_token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Body() body: LogoutDto) {
    const authorizationHeader = req.headers.authorization;
    const refreshToken = body.refresh_token;

    // Check if Authorization header exists
    if (!authorizationHeader) {
      return { message: 'Authorization header not found' };
    }

    // Extract the access token
    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      return { message: 'Invalid token format' };
    }

    // Decode access token to extract jti and other details
    const decoded = this.authService.jwtService.decode(accessToken);
    const jti = decoded['jti']; // Extract jti from the token payload

    if (jti) {
      // Optionally blacklist the access token
      const expiresIn = decoded['exp'] - Math.floor(Date.now() / 1000);
      await this.authService.blacklistToken(jti, expiresIn);
    }

    // Decode refresh token to get its ID
    const refreshTokenDecoded =
      this.authService.jwtService.decode(refreshToken);
    const refreshTokenId = refreshTokenDecoded['rti'];

    if (refreshTokenId) {
      // Delete the refresh token from Redis using userId and rti
      await this.authService.deleteRefreshToken(decoded['id'], refreshTokenId);
    }

    return { message: 'Logged out successfully' };
  }
}
