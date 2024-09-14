// src/auth/auth.controller-business-logics.ts
import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Redirect,
  Req,
  Request,
  UnauthorizedException,
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
import { createControllerResponseHandlers } from '../common';

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
  async register(@Body() userData: RegisterDto) {
    const { buildSuccessResponse } =
      createControllerResponseHandlers('register');
    const res = await this.authService.userService.createUser(userData);
    const { success, serviceBusinessLogicCode, data } = res;
    if (success) return buildSuccessResponse('REGISTERED_SUCCESSFULLY', data);
    switch (serviceBusinessLogicCode) {
      case 'EMAIL_ALREADY_EXISTS':
        throw new ConflictException(serviceBusinessLogicCode);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const res = await this.authService.login(loginDto);
    const { buildSuccessResponse } = createControllerResponseHandlers('login');
    const { success, serviceBusinessLogicCode, data } = res;
    if (success) return buildSuccessResponse('LOGGED_IN_SUCCESSFULLY', data);
    switch (serviceBusinessLogicCode) {
      case 'USER_OR_PASSWORD_DOES_NOT_MATCH':
        throw new UnauthorizedException('USER_OR_PASSWORD_DOES_NOT_MATCH');
    }
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
    const res = await this.authService.refresh(refreshToken);
    const { serviceBusinessLogicCode } = res;
    switch (serviceBusinessLogicCode) {
      case 'INVALID_REFRESH_TOKEN':
        throw new UnauthorizedException(serviceBusinessLogicCode);
    }

    return res;
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
      throw new UnauthorizedException('AUTHORIZATION_HEADER_NOT_FOUND');
    }

    // Extract the access token
    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('INVALID_TOKEN_FORMAT');
    }

    await this.authService.logout(accessToken, refreshToken);

    const { buildSuccessResponse } = createControllerResponseHandlers('logout');
    return buildSuccessResponse('LOGGED_OUT_SUCCESSFULLY');
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
  ) {
    const userId = req.user.id; // Jwt Auth Guard will add user information to the request object
    const res = await this.authService.changePassword(userId, userData);
    const { success, serviceBusinessLogicCode, data } = res;
    const { buildSuccessResponse } =
      createControllerResponseHandlers('changePassword');

    if (success)
      return buildSuccessResponse('PASSWORD_CHANGED_SUCCESSFULLY', data);
    switch (serviceBusinessLogicCode) {
      case 'USER_NOT_FOUND':
        throw new NotFoundException('USER_NOT_FOUND');
      case 'ORIGINAL_PASSWORD_IS_INCORRECT':
        throw new UnauthorizedException('ORIGINAL_PASSWORD_IS_INCORRECT');
    }
  }
}
