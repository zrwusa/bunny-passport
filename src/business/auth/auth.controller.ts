// src/auth/auth.controller.ts
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ExpressReqWithUser } from '../../types';
import { Request as ExpressReq } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { controllerResponseCreator } from '../../common';
import { UserMapper } from '../user/mapper/user.mapper';
import { GoogleAuthGuard } from './guards/google-auth.guard';

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
  async register(@Body() registerDto: RegisterDto) {
    const { buildSuccess, throwFailure } =
      controllerResponseCreator.createBuilders('register');
    const res = await this.authService.userService.createUser(registerDto);
    const { success, code, data } = res;
    if (success) {
      const safeUser = UserMapper.toResponseDto(data);

      return buildSuccess('REGISTERED_SUCCESSFULLY', safeUser);
    }

    switch (code) {
      case 'EMAIL_ALREADY_EXISTS':
        throwFailure(ConflictException, 'EMAIL_ALREADY_EXISTS');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const res = await this.authService.login(loginDto);
    const { buildSuccess, throwFailure } =
      controllerResponseCreator.createBuilders('login');
    const {
      success,
      code,
      data: { user: resUser, tokens },
    } = res;
    const user = UserMapper.toResponseDto(resUser);
    if (success)
      return buildSuccess('LOGGED_IN_SUCCESSFULLY', { user, tokens });
    switch (code) {
      case 'USER_OR_PASSWORD_DOES_NOT_MATCH':
        throwFailure(UnauthorizedException, 'USER_OR_PASSWORD_DOES_NOT_MATCH');
        break;
      case 'LOGIN_FAILED':
        throwFailure(UnauthorizedException, 'LOGGED_IN_FAILED');
        break;
    }
    throwFailure(UnauthorizedException, 'LOGGED_IN_FAILED');
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login' })
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // bootstrap to google oauth2 flow
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  async googleLoginCallback(@Request() req: ExpressReqWithUser) {
    const tokens = await this.authService.generateTokens(req.user);

    // get redirect_uri from session
    const redirectTo =
      req.session.redirect_uri ||
      this.configService.get('OAUTH2_LOGIN_CALLBACK_DEFAULT_REDIRECT_URL');

    // //Set HttpOnly and Secure Cookies
    // res.cookie('accessToken', tokens.accessToken, {
    //   httpOnly: true,
    //   secure: true,
    //   // sameSite: 'Lax',
    //   maxAge: 3600 * 1000,
    // });
    //
    // res.cookie('refreshToken', tokens.refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   // sameSite: 'Lax',
    //   maxAge: 7 * 24 * 3600 * 1000,
    // });

    return {
      url: `${redirectTo}?access-token=${tokens.accessToken}&refresh-token=${tokens.refreshToken}`,
    };

    // return `
    //     <html>
    //     <head>
    //         <title>Logging in...</title>
    //     </head>
    //     <body>
    //         <script>
    //             const accessToken = '${tokens.accessToken}';
    //             const refreshToken = '${tokens.refreshToken}';
    //
    //             // 使用 postMessage 发送 tokens
    //             postMessage({ accessToken, refreshToken }, 'http://localhost:3000');
    //
    //             // // 自动跳转到前端页面
    //             // window.location.href = '${redirectTo}';
    //         </script>
    //     </body>
    //     </html>
    // `;
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
    // get redirect_uri from session
    const redirectTo =
      req.session.redirect_uri ||
      this.configService.get('OAUTH2_LOGIN_CALLBACK_DEFAULT_REDIRECT_URL');
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
    const { success, data } = res;
    const { buildSuccess, throwFailure } =
      controllerResponseCreator.createBuilders('refresh');

    if (success) return buildSuccess('REFRESH_TOKEN_SUCCESSFULLY', data);

    throwFailure(UnauthorizedException, 'REFRESH_TOKEN_FAILED');
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

    const { buildSuccess, throwFailure } =
      controllerResponseCreator.createBuilders('logout');

    // Check if Authorization header exists
    if (!authorizationHeader) {
      throwFailure(UnauthorizedException, 'AUTHORIZATION_HEADER_NOT_FOUND');
    }

    // Extract the access token
    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      throwFailure(UnauthorizedException, 'INVALID_TOKEN_FORMAT');
    }

    await this.authService.logout(accessToken, refreshToken);

    return buildSuccess('LOGGED_OUT_SUCCESSFULLY');
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
    const { success, code, data } = res;
    const { buildSuccess, throwFailure } =
      controllerResponseCreator.createBuilders('changePassword');

    if (success) return buildSuccess('PASSWORD_CHANGED_SUCCESSFULLY', data);
    switch (code) {
      case 'USER_NOT_FOUND':
        throwFailure(NotFoundException, 'USER_NOT_FOUND');
        break;
      case 'ORIGINAL_PASSWORD_IS_INCORRECT':
        throwFailure(UnauthorizedException, 'ORIGINAL_PASSWORD_IS_INCORRECT');
        break;
    }
  }

  @Patch('validate-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req: ExpressReqWithUser) {
    const { authorization } = req.headers;
    const { buildSuccess, throwFailure } =
      controllerResponseCreator.createBuilders('validateToken');
    if (!authorization)
      return throwFailure(UnauthorizedException, 'TOKEN_VALIDATION_FAILED');
    const bearerSplit = authorization.split('Bearer');

    if (bearerSplit.length < 2)
      return throwFailure(UnauthorizedException, 'TOKEN_VALIDATION_FAILED');
    const accessToken = bearerSplit[1].trim();
    const res = await this.authService.validateToken(accessToken);
    const { success, code } = res;

    if (success) return buildSuccess('VALIDATED_SUCCESSFULLY');
    switch (code) {
      case 'MALFORMED_TOKEN':
        throwFailure(NotFoundException, 'MALFORMED_TOKEN');
        break;
      case 'TOKEN_VALIDATION_FAILED':
        throwFailure(UnauthorizedException, 'TOKEN_VALIDATION_FAILED');
        break;
    }
  }
}
