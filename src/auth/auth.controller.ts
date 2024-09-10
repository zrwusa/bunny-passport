// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

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
  async googleLoginCallback(@Request() req, @Res() res) {
    const token = await this.authService.oauthLogin(req.user, 'google');
    res.redirect(`/success?token=${token.access_token}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Redirect to Github
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Request() req, @Res() res) {
    const token = await this.authService.oauthLogin(req.user, 'github');
    res.redirect(`/success?token=${token.access_token}`);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(
    @Request() req,
    @Body('refresh_token') refreshToken: string,
  ) {
    return this.authService.refresh(req.user, refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Body('refresh_token') refreshToken: string) {
    const authorizationHeader = req.headers.authorization;

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
      await this.authService.deleteRefreshToken(decoded['sub'], refreshTokenId);
    }

    return { message: 'Logged out successfully' };
  }
}
