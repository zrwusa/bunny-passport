// src/guards/google-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const redirectUri = req.query.redirect_uri as string;

    // Check if session exists
    if (!req.session)
      throw new UnauthorizedException('Session is not initialized');

    // Determine the current request path and save redirect_uri only when performing OAuth login.
    if (req.path === '/auth/google') {
      req.session.redirect_uri = redirectUri;
      // Make sure the session is saved to storage
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => (err ? reject(err) : resolve()));
      });
    }

    // Continue with the certification process
    return (await super.canActivate(context)) as boolean;
  }
}
