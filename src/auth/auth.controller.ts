// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Redirect,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ExpressReqWithUser } from '../types';
import { Request as ExpressReq } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'string',
      example: 'User created successfully',
    },
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Default example',
        value: {
          username: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
        },
      },
    },
  })
  async create(@Body() userData: RegisterDto): Promise<string> {
    return this.authService.userService.createUser(userData);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleLoginCallback(@Request() req: ExpressReqWithUser) {
    // The user object is injected by Google Strategy validate function
    const tokens = await this.authService.generateTokens(req.user);
    const redirectTo = this.configService.get(
      'OAUTH2_LOGIN_CALLBACK_REDIRECT_URL',
    );
    return {
      url: `${redirectTo}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
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
  async githubLoginCallback(@Request() req: ExpressReqWithUser) {
    const tokens = await this.authService.generateTokens(req.user);
    const redirectTo = this.configService.get(
      'OAUTH2_LOGIN_CALLBACK_REDIRECT_URL',
    );
    return {
      url: `${redirectTo}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    };
  }

  @Post('refresh')
  async refreshToken(
    @Request() req: ExpressReq,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const { refreshToken } = refreshTokenDto;
    return this.authService.refresh(refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Request() req: ExpressReqWithUser,
    @Body() logoutDto: LogoutDto,
  ) {
    // TODO there is a bug: when we use a refresh token that no longer exists in Redis, it will still be added to the blacklist.
    const authorizationHeader = req.headers.authorization;
    const refreshToken = logoutDto.refreshToken;

    // Check if Authorization header exists
    if (!authorizationHeader) {
      return { message: 'Authorization header not found' };
    }

    // Extract the access token
    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      return { message: 'Invalid token format' };
    }

    await this.authService.logout(accessToken, refreshToken);

    return { message: 'Logged out successfully' };
  }

  @Patch('change-password')
  @ApiBody({
    type: ChangePasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: ExpressReqWithUser,
    @Body() userData: ChangePasswordDto,
  ): Promise<string> {
    const userId = req.user.id; // Jwt Auth Guard will add user information to the request object
    return this.authService.changePassword(userId, userData);
  }
}
