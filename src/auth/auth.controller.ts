import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async githubAuth(@Req() req) {
    // GitHub login redirects to GitHub for authentication
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthRedirect(@Req() req, @Res() res) {
    // After successful login, handle the authenticated user here
    // return {
    //   message: 'User information from GitHub',
    //   user: req.user,
    // };

    // After successful login, redirect to the frontend login page with user info
    const user = req.user;
    // Optionally, you can pass user information via query parameters or other methods
    res.redirect(
      `http://localhost:${this.configService.get('FRONT_PORT')}/auth/sign-in?auth=${encodeURIComponent(JSON.stringify(user))}`,
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req) {
    // Google login redirects to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    // // After successful login, handle the authenticated user here
    // return {
    //   message: 'User information from Google',
    //   user: req.user,
    // };

    // After successful login, redirect to the frontend login page with user info
    const user = req.user;
    // Optionally, you can pass user information via query parameters or other methods
    res.redirect(
      `http://localhost:${this.configService.get('FRONT_PORT')}/auth/sign-in?auth=${encodeURIComponent(JSON.stringify(user))}`,
    );
  }
}
